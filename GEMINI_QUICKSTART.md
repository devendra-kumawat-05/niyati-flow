# 🚀 Gemini AI Quick Start (FREE!)

## Get Your FREE Gemini API Key in 2 Minutes

### Step 1: Get API Key
1. Open: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

### Step 2: Update `.env` File
Open `d:\niyati-flow\.env` and add:

```env
# Gemini API Key (FREE!)
GEMINI_API_KEY=your-gemini-api-key-here

# JWT Secret for authentication (any random string)
JWT_SECRET=your-secret-key-here-use-any-random-string
```

**Remove or comment out:**
```env
# USE_MOCK_AI=true
```

### Step 3: Restart Server
```bash
# Press Ctrl+C to stop the current server
# Then run:
npm run dev
```

### Step 4: Test!
1. Open: http://localhost:3000/chat
2. Send a message
3. Get AI-powered responses! 🎉

---

## Gemini Free Tier Limits

- **60 requests per minute**
- **1,500 requests per day**
- **1 million requests per month**
- **NO CREDIT CARD REQUIRED**

This is more than enough for development and even small production apps!

---

## Troubleshooting

**Error: "Gemini API key is not configured"**
- Make sure you added `GEMINI_API_KEY` to your `.env` file
- Restart the dev server

**Error: "Invalid Gemini API key"**
- Double-check you copied the entire key
- Make sure there are no extra spaces

**Still seeing mock responses?**
- Make sure `USE_MOCK_AI=true` is removed or commented out
- Restart the server

---

## What You Get

✅ Natural conversations with context awareness
✅ Smart, helpful responses
✅ Fast response times
✅ Completely FREE
✅ No billing worries

Enjoy your AI-powered chat! 🚀
