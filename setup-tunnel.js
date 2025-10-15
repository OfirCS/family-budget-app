#!/usr/bin/env node

/**
 * Automated Tunnel & Twilio Setup
 * Sets up ngrok tunnel and configures Twilio webhook
 */

const ngrok = require('ngrok');
const twilio = require('twilio');
require('dotenv').config();
const axios = require('axios');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const BOT_PORT = process.env.BOT_PORT || 3002;

async function setupTunnel() {
  try {
    console.log('\n🚀 Starting WhatsApp Bot Tunnel Setup...\n');

    // Step 1: Start ngrok tunnel
    console.log('📡 Starting ngrok tunnel on port ' + BOT_PORT + '...');
    const url = await ngrok.connect(BOT_PORT);
    console.log('✅ Tunnel created: ' + url);

    const webhookUrl = url + '/whatsapp';
    console.log('📍 Webhook URL: ' + webhookUrl);

    // Step 2: Update Twilio webhook
    console.log('\n⚙️  Updating Twilio webhook...');
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    try {
      const incomingPhoneNumber = await client.incomingPhoneNumbers.list({ limit: 1 });

      if (incomingPhoneNumber.length === 0) {
        console.log('⚠️  No incoming phone numbers found');
        console.log('📱 Please set up WhatsApp Sandbox first in Twilio Console');
        return;
      }

      const phoneNumber = incomingPhoneNumber[0];

      // Update the webhook
      await client
        .incomingPhoneNumbers(phoneNumber.sid)
        .update({
          smsUrl: webhookUrl,
          smsMethod: 'POST',
        });

      console.log('✅ Twilio webhook updated!');
      console.log('   Phone Number SID: ' + phoneNumber.sid);
    } catch (error) {
      // Try alternative approach using Twilio API directly
      console.log('📤 Attempting direct API update...');

      try {
        const response = await axios.post(
          'https://api.twilio.com/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/IncomingPhoneNumbers.json',
          {
            SmsUrl: webhookUrl,
            SmsMethod: 'POST',
          },
          {
            auth: {
              username: TWILIO_ACCOUNT_SID,
              password: TWILIO_AUTH_TOKEN,
            },
          }
        );

        console.log('✅ Direct API update successful!');
      } catch (apiError) {
        console.log('⚠️  Could not auto-update webhook');
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('   1. Go to https://console.twilio.com');
        console.log('   2. Messaging → Settings → WhatsApp Sandbox Settings');
        console.log('   3. Paste this URL in "Webhook URL":');
        console.log('      ' + webhookUrl);
        console.log('   4. Click Save');
      }
    }

    // Step 3: Test the bot
    console.log('\n🧪 Testing bot connection...');
    try {
      const testResponse = await axios.get('http://localhost:' + BOT_PORT + '/health');

      if (testResponse.data.status === 'OK') {
        console.log('✅ Bot is healthy and responding!');
        console.log('\n✨ Your WhatsApp Bot is ready to use!');
      }
    } catch (testError) {
      console.log('⚠️  Could not reach bot. Make sure bot server is running: npm run bot');
    }

    // Step 4: Display instructions
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SETUP COMPLETE!\n');
    console.log('📱 Text your Twilio WhatsApp number to test:\n');
    console.log('   • "spent $50 on groceries"');
    console.log('   • "20 taxi"');
    console.log('   • "budget"');
    console.log('   • "help"\n');
    console.log('🔗 Public URL: ' + url);
    console.log('💾 Tunnel will stay active. Press Ctrl+C to stop.\n');
    console.log('='.repeat(60) + '\n');

    // Keep tunnel alive
    console.log('⏳ Tunnel is active and listening...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Closing tunnel...');
  await ngrok.kill();
  process.exit(0);
});

setupTunnel();
