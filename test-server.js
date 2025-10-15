// Simple test server to verify Railway deployment
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.send('Railway is working! Bot server is alive.');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    port: PORT,
    env_vars: {
      has_twilio: !!process.env.TWILIO_ACCOUNT_SID,
      has_auth: !!process.env.TWILIO_AUTH_TOKEN,
      has_numbers: !!process.env.ALLOWED_PHONE_NUMBERS,
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Environment check:');
  console.log('- Twilio SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING');
  console.log('- Twilio Auth:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'MISSING');
  console.log('- Allowed Numbers:', process.env.ALLOWED_PHONE_NUMBERS ? 'SET' : 'MISSING');
});
