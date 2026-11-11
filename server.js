const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Hardcoded admin credentials (use environment variables in production)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'RigFitAdmin2026!';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'rigfitrv-secure-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Authentication Middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/login');
};

// Login Page
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>RigFitRV Admin Login</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc;">
      <div class="article-card" style="width: 100%; max-width: 400px; padding: 2rem;">
        <h2>RigFitRV Admin Portal</h2>
        <form action="/login" method="POST" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
          <input type="text" name="username" placeholder="Username" required style="padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 4px;">
          <input type="password" name="password" placeholder="Password" required style="padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 4px;">
          <button type="submit" class="btn" style="padding: 0.75rem; background: #2563eb; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Secure Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAuthenticated = true;
    return res.redirect('/admin');
  }
  res.redirect('/login?error=1');
});

// Admin Dashboard UI
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// API Endpoint to Add Campground & Generate Files
app.post('/api/campgrounds', requireAuth, (req, res) => {
  const data = req.body;
  
  // 1. Update campgrounds.json
  const campgroundsPath = path.join(__dirname, 'data', 'campgrounds.json');
  let campgrounds = [];
  try {
    campgrounds = JSON.parse(fs.readFileSync(campgroundsPath, 'utf8'));
  } catch (e) {
    campgrounds = [];
  }
  
  // Check if exists, update or push
  const index = campgrounds.findIndex(c => c.id === data.id);
  if (index >= 0) {
    campgrounds[index] = data;
  } else {
    campgrounds.push(data);
  }
  fs.writeFileSync(campgroundsPath, JSON.stringify(campgrounds, null, 2));

  // 2. Generate HTML Leaf File in /c/
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name} Guide - RigFitRV</title>
  <meta name="description" content="Verified RV clearance, routing guidance, and campground insights for ${data.name} in ${data.city}, ${data.state}.">
  <link rel="stylesheet" href="../style.css">
  <link rel="icon" type="image/x-icon" href="../favicon.ico">
</head>
<body data-campground-id="${data.id}">
  <div id="header-placeholder"></div>
  <script>fetch('../header.html').then(r => r.text()).then(d => document.getElementById('header-placeholder').innerHTML = d);</script>
  <div class="container">
    <div class="article-card">
      <h1 id="camp-title">${data.name} Guide</h1>
      <table class="campground-info-table" id="camp-info-table"></table>
      <hr>
      <h2>🚚 The Quick Rig-Fit Scorecard</h2>
      <div class="scorecard" id="camp-scorecard"></div>
      <hr>
      <div id="camp-approach-section"></div>
      <hr>
      <h2>🏕️ Campground Overview & Atmosphere</h2>
      <div id="camp-overview"></div>
      <hr>
      <h2>🚗 Toad Unhook Strategy</h2>
      <div id="camp-toad-strategy"></div>
    </div>
  </div>
  <div id="footer-placeholder"></div>
  <script>fetch('../footer.html').then(r => r.text()).then(d => document.getElementById('footer-placeholder').innerHTML = d);</script>
  <script src="../js/campground.js"></script>
</body>
</html>`;

  const leafFilePath = path.join(__dirname, 'c', `${data.id}.html`);
  fs.writeFileSync(leafFilePath, htmlTemplate);

  res.json({ success: true, message: `Successfully generated ${data.id}.html and updated campgrounds.json!` });
});

app.listen(PORT, () => {
  console.log(`RigFitRV Admin Panel running securely at http://localhost:${PORT}/admin`);
});
