require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MIDDLEWARE & CORS ---
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173', 
    'https://sakthivelan.netlify.app' 
  ], 
  methods: ['GET', 'POST', 'OPTIONS'] 
}));
app.use(express.json());

// --- 2. DATABASE SETUP & MODELS ---
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("[SYSTEM] MongoDB Connected Successfully"))
  .catch((err) => console.log("[ERROR] MongoDB Connection Error: ", err));

// OTP Schema (Auto-deletes after 5 minutes)
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } 
});
const Otp = mongoose.model('Otp', otpSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// --- 3. NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Must be explicitly set
  port: 465, // Force secure port (Render allows this)
  secure: true, // true for 465, false for 587
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD 
  }
});

// --- 4. UTILITY FUNCTIONS ---
function maskEmail(email) {
  const [name, domain] = email.split('@');
  if (name.length <= 3) return `${name}xxx@${domain}`;
  const start = name.slice(0, 3);
  const end = name.slice(-3);
  return `${start}xxx${end}@${domain}`;
}

// --- 5. GITHUB GRAPHQL PIPELINE (Existing) ---
let githubCache = null;
let githubCacheTimestamp = null;
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

app.get('/api/github', async (req, res) => {
  const now = Date.now();

  if (githubCache && githubCacheTimestamp && (now - githubCacheTimestamp < CACHE_DURATION_MS)) {
    console.log('[SYSTEM] Serving GitHub data from memory cache.');
    return res.status(200).json(githubCache);
  }

  console.log('[SYSTEM] Cache empty or expired. Fetching fresh data from GitHub...');
  const query = `
    query($userName:String!) {
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios({
      url: 'https://api.github.com/graphql',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: { query: query, variables: { userName: process.env.GITHUB_USERNAME } }
    });

    if (response.data.errors) throw new Error(response.data.errors[0].message);

    const calendar = response.data.data.user.contributionsCollection.contributionCalendar;
    githubCache = calendar;
    githubCacheTimestamp = now;

    res.status(200).json(calendar);
  } catch (error) {
    console.error('[ERROR] GitHub API failed:', error.message);
    if (githubCache) {
      console.log('[SYSTEM] Serving stale cache as fallback.');
      return res.status(200).json(githubCache);
    }
    res.status(500).json({ error: 'Failed to fetch GitHub statistics' });
  }
});

// --- 6. CONTACT & OTP PIPELINE (New) ---

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const generatedOtp = crypto.randomInt(10000, 99999).toString();
    await Otp.deleteMany({ email }); // Clear old OTPs
    await Otp.create({ email, otp: generatedOtp });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your Portfolio Verification Code',
      text: `Your verification code is: ${generatedOtp}. It will expire in 5 minutes.`
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error('[ERROR] Failed to send OTP:', error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    await Otp.deleteOne({ email }); // Burn the OTP after use
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error('[ERROR] Verification failed:', error);
    res.status(500).json({ error: "Server error during verification" });
  }
});

app.post('/api/submit-contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await Contact.create({ name, email, message });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to yourself
      subject: `New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    });

    res.status(200).json({ message: "Message received successfully" });
  } catch (error) {
    console.error('[ERROR] Failed to submit message:', error);
    res.status(500).json({ error: "Failed to submit message" });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    // We use MongoDB Aggregation to process data directly in the database
    const clients = await Contact.aggregate([
      { $sort: { date: 1 } }, // 1. Sort from oldest to newest
      {
        $group: {
          _id: "$email",             // 2. Group by unique email
          name: { $last: "$name" },  // 3. Take the latest name used
          msgCount: { $sum: 1 }      // 4. Count how many times they messaged
        }
      },
      { $sort: { msgCount: -1 } }    // 5. Sort by highest message count first
    ]);

    const count = clients.length; // Now this is the strictly UNIQUE count
    
    // Mask the emails before sending to frontend
    const maskedClients = clients.map(client => ({
      name: client.name,
      maskedEmail: maskEmail(client._id),
      msgCount: client.msgCount
    }));

    res.status(200).json({ count, clients: maskedClients });
  } catch (error) {
    console.error('[ERROR] Failed to fetch clients:', error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});
// --- 7. HEALTH CHECK & INIT ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Active', message: 'API is running.' });
});

app.listen(PORT, () => {
  console.log(`[SYSTEM] Server initialized on port ${PORT}`);
});