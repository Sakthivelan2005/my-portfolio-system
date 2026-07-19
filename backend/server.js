const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET']
}));
app.use(express.json());

// --- CACHE ARCHITECTURE ---
let githubCache = null;
let githubCacheTimestamp = null;
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

// --- GITHUB GRAPHQL PIPELINE ---
app.get('/api/github', async (req, res) => {
  const now = Date.now();

  // 1. Check Cache
  if (githubCache && githubCacheTimestamp && (now - githubCacheTimestamp < CACHE_DURATION_MS)) {
    console.log('[SYSTEM] Serving GitHub data from memory cache.');
    return res.status(200).json(githubCache);
  }

  console.log('[SYSTEM] Cache empty or expired. Fetching fresh data from GitHub GraphQL API...');

  // 2. The GraphQL Query
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
      data: {
        query: query,
        variables: { userName: process.env.GITHUB_USERNAME }
      }
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    // 3. Extract exact data needed and update Cache
    const calendar = response.data.data.user.contributionsCollection.contributionCalendar;
    
    githubCache = calendar;
    githubCacheTimestamp = now;

    res.status(200).json(calendar);

  } catch (error) {
    console.error('[ERROR] GitHub API failed:', error.message);
    
    // Fallback: If API fails but we have old cache, serve stale cache instead of breaking the UI
    if (githubCache) {
      console.log('[SYSTEM] Serving stale cache as fallback.');
      return res.status(200).json(githubCache);
    }

    res.status(500).json({ error: 'Failed to fetch GitHub statistics' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Active', message: 'API is running.' });
});

app.listen(PORT, () => {
  console.log(`[SYSTEM] Server initialized on port ${PORT}`);
});