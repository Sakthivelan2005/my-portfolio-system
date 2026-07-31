require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto');
const dns = require('dns'); 

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:4173', 
      'https://sakthivelan.netlify.app',
      'https://sakthivelan.me', 
      'https://www.sakthivelan.me'
    ], 
    methods: ['GET', 'POST', 'OPTIONS'] 
  }
});

io.on('connection', (socket) => {
  console.log(`[SYSTEM] Client connected to live socket: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[SYSTEM] Client disconnected: ${socket.id}`);
  });
});

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

// THE FIX 1: Removed 'message' from the schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
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

// THE FIX: Dynamic Disposable Domain Blocker
let disposableDomains = new Set();

async function updateDisposableDomains() {
  try {
    // Fetches an open-source, constantly updated JSON array of burner domains
    const res = await axios.get('https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.json');
    disposableDomains = new Set(res.data);
    console.log(`[SYSTEM] Successfully loaded ${disposableDomains.size} disposable domains to block.`);
  } catch (err) {
    console.error('[ERROR] Failed to load disposable domains list. Using empty set.', err.message);
  }
}

// Run on startup, and refresh the list automatically every 24 hours
updateDisposableDomains();
setInterval(updateDisposableDomains, 24 * 60 * 60 * 1000);

async function fetchClientStats() {
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

  return { count, clients: maskedClients };
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
  const domain = normalizedEmail.split('@')[1];

  // 1. Instantly reject known burner/disposable domains (O(1) lookup time)
  if (disposableDomains.has(domain)) {
    return res.status(400).json({ 
      error: "⚠️ Temporary or disposable burner emails are not allowed. Please use a real email address." 
    });
  }

  // 2. Fallback to DNS MX Check to ensure the domain can actually receive mail
  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return res.status(400).json({ 
        error: "⚠️ I couldn't find that email address anywhere in the world! If you just want to test my system, use my email: sakthivelan.shankar@gmail.com" 
      });
    }
  } catch (dnsError) {
    return res.status(400).json({ 
      error: "⚠️ I couldn't find that email address anywhere in the world! If you just want to test my system, use my email: sakthivelan.shankar@gmail.com" 
    });
  }

  try {
    const existingOtp = await Otp.findOne({ email: normalizedEmail });
    
    if (existingOtp && existingOtp.createdAt) {
      const timeSinceCreation = Date.now() - new Date(existingOtp.createdAt).getTime();
      
      if (timeSinceCreation < 120000) { 
        return res.status(429).json({ 
          error: "⚠️ Hold on! I just sent a verification code to this exact email. Please check your inbox (and spam folder), or wait 2 minutes before asking me to send another one!" 
        });
      }
    }

    const generatedOtp = crypto.randomInt(10000, 99999).toString();
    
    await Otp.deleteMany({ email: normalizedEmail }); 
    await Otp.create({ email: normalizedEmail, otp: generatedOtp });

    try {
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
    const record = await Otp.findOne({ email: normalizedEmail });
    
    if (!record) {
      return res.status(400).json({ 
        type: "EXPIRED",
        error: "⏳ Time is up! Your verification code expired after 5 minutes. Please request a new one." 
      });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ 
        type: "INVALID",
        error: "❌ Oops! That is the wrong code. Please check your email carefully and try again." 
      });
    }

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
    // THE FIX 2: Do NOT pass 'message' into Contact.create()
    await Contact.create({ name: name.trim(), email: normalizedEmail });

    // We still use the 'message' variable here to send the email to YOU
    await axios.post(process.env.GOOGLE_SCRIPT_URL, {
      to: 'sakthivelan.shankar@gmail.com', 
      subject: `New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${normalizedEmail}\nMessage: ${message}`
    });

    try {
      const updatedStats = await fetchClientStats();
      io.emit('live_client_update', updatedStats);
    } catch (socketError) {
      console.error('[ERROR] Socket broadcast failed:', socketError);
    }

    res.status(200).json({ message: "Message received successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit message" });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    const stats = await fetchClientStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Active', message: 'API is running.' });
});

server.listen(PORT, () => {
  console.log(`[SYSTEM] Server initialized on port ${PORT}`);
});