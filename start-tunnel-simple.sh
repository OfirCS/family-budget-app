#!/bin/bash

# Simple ngrok tunnel setup
echo "🚀 Starting WhatsApp Bot Tunnel..."
echo ""
echo "🤖 Bot server: http://localhost:3002"
echo ""
echo "📡 Starting ngrok tunnel..."
echo ""

# Start ngrok on port 3002
ngrok http 3002 --log=stdout

# When ngrok starts, it will display:
# - The public URL (e.g., https://abc123.ngrok.io)
# - Copy that URL

echo ""
echo "📍 When tunnel starts, you'll see the public URL above"
echo "   Copy it and use in Twilio webhook:"
echo "   https://your-ngrok-url.ngrok.io/whatsapp"
