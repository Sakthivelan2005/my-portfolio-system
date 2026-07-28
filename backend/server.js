require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173', 
    'https://sakthivelan.netlify.app',
    'https://sakthivelan.me', 
    'https://www.sakthivelan.me'
  ], 
  methods: ['GET', 'POST', 'OPTIONS'] 
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("[SYSTEM] MongoDB Connected Successfully"))
  .catch((err) => console.log("[ERROR] MongoDB Connection Error: ", err));

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } 
});
const Otp = mongoose.model('Otp', otpSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

function maskEmail(email) {
  const [name, domain] = email.split('@');
  if (name.length <= 3) return `${name}xxx@${domain}`;
  const start = name.slice(0, 3);
  const end = name.slice(-3);
  return `${start}xxx${end}@${domain}`;
}

let githubCache = null;
let githubCacheTimestamp = null;
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; 

app.get('/api/github', async (req, res) => {
  const now = Date.now();

  if (githubCache && githubCacheTimestamp && (now - githubCacheTimestamp < CACHE_DURATION_MS)) {
    return res.status(200).json(githubCache);
  }

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
    if (githubCache) return res.status(200).json(githubCache);
    res.status(500).json({ error: 'Failed to fetch GitHub statistics' });
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingOtp = await Otp.findOne({ email: normalizedEmail });
    if (existingOtp) {
      const timeSinceCreation = Date.now() - existingOtp.createdAt.getTime();
      if (timeSinceCreation < 60000) { 
        return res.status(429).json({ 
          error: "Whoa there, Flash! ⚡ Your verification is already ongoing. Check your inbox!" 
        });
      }
    }

    const generatedOtp = crypto.randomInt(10000, 99999).toString();
    
    await Otp.deleteMany({ email: normalizedEmail }); 
    await Otp.create({ email: normalizedEmail, otp: generatedOtp });

    try {
      // THE FIX: We bypass SMTP entirely and use an HTTP POST request to Google
      const googleResponse = await axios.post(process.env.GOOGLE_SCRIPT_URL, {
        to: normalizedEmail,
        subject: 'Your Verification Code from my Portfolio...!',
        text: `Your verification code is: ${generatedOtp}. It will expire in 5 minutes.`
      });

      if (googleResponse.data.error) throw new Error(googleResponse.data.error);
      
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (apiError) {
      await Otp.deleteMany({ email: normalizedEmail });
      throw apiError; 
    }

  } catch (error) {
    console.error('[FATAL ERROR] HTTP API failed to send OTP. Details:', error.message);
    res.status(500).json({ error: "Server communication failed. Try again later." });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });
  
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const record = await Otp.findOne({ email: normalizedEmail, otp: otp.trim() });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    await Otp.deleteOne({ email: normalizedEmail }); 
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error during verification" });
  }
});

app.post('/api/submit-contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await Contact.create({ name: name.trim(), email: normalizedEmail, message: message.trim() });

    // Send the notification to yourself via the new Google API
    // Replace 'your-email@example.com' with the email where you want to read the messages
    await axios.post(process.env.GOOGLE_SCRIPT_URL, {
      to: 'sakthivelan.shankaran@gmail.com', 
      subject: `New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${normalizedEmail}\nMessage: ${message}`
    });

    res.status(200).json({ message: "Message received successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit message" });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Contact.aggregate([
      { $sort: { date: 1 } }, 
      {
        $group: {
          _id: "$email", 
          name: { $last: "$name" }, 
          msgCount: { $sum: 1 } 
        }
      },
      { $sort: { msgCount: -1 } } 
    ]);

    const count = clients.length; 
    
    const maskedClients = clients.map(client => ({
      name: client.name,
      maskedEmail: maskEmail(client._id),
      msgCount: client.msgCount
    }));

    res.status(200).json({ count, clients: maskedClients });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Active', message: 'API is running.' });
});

app.listen(PORT, () => {
  console.log(`[SYSTEM] Server initialized on port ${PORT}`);
});