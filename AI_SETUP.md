# AI Integration Setup Guide

## 🎉 Now Using Google Gemini (FREE!)

The app now supports **Google Gemini AI** with a generous free tier!

**Gemini Free Tier Benefits:**
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ 1 million requests per month
- ✅ Completely FREE - no credit card required!

## Quick Setup (Recommended)

### Get Your FREE Gemini API Key:

1. **Visit Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in with your Google account**
3. **Click "Create API Key"**
4. **Copy your API key**

### Add to Your `.env` File:

```env
# Google Gemini API Key (FREE!)
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: Remove or comment out these if you had them
# USE_MOCK_AI=true
# OPENAI_API_KEY=...
```

### Restart Your Dev Server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

That's it! You now have **free AI responses** with Gemini! 🎉

---

## Alternative Options

### Option 1: Use Mock AI (Immediate - No API Key Required)

The app now automatically falls back to a demo AI when OpenAI is unavailable.

**To force mock AI mode:**
1. In your `.env` file, add:
   ```env
   USE_MOCK_AI=true
   ```
2. Restart your dev server

**Features:**
- ✅ Works immediately without API credits
- ✅ Provides pattern-based responses
- ✅ Good for testing and development
- ❌ Limited conversational abilities

### Option 2: Use OpenAI (Requires Payment)

#### Check Your OpenAI Account:

1. **Visit your usage page:** https://platform.openai.com/usage
   - Check if you've exceeded your quota

2. **Check your billing:** https://platform.openai.com/account/billing
   - Free tier has limited credits ($5-$18 depending on when you signed up)
   - Add payment method to continue using the API

3. **Check rate limits:** https://platform.openai.com/account/limits
   - Free tier: 3 requests per minute
   - Paid tier: Higher limits based on usage tier

#### Add Credits to Your Account:

1. Go to https://platform.openai.com/account/billing
2. Click "Add payment method"
3. Add a credit card
4. Set up usage limits to avoid unexpected charges

#### Wait for Rate Limit Reset:

- Rate limits reset every minute
- Wait 60 seconds and try again

## AI Provider Priority

The app automatically selects AI providers in this order:

1. **Mock AI** - If `USE_MOCK_AI=true`
2. **Google Gemini** - If `GEMINI_API_KEY` is set (Recommended - FREE!)
3. **OpenAI** - If `OPENAI_API_KEY` is set (Requires payment)
4. **Mock AI** - Fallback if no keys are configured

## Environment Variables Examples

**Recommended Setup (FREE Gemini):**
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**Mock AI (No API key needed):**
```env
USE_MOCK_AI=true
```

**OpenAI (Requires payment):**
```env
OPENAI_API_KEY=sk-proj-your-api-key-here
```

## Testing the Chat

1. **Restart your dev server** after changing `.env`:
   ```bash
   npm run dev
   ```

2. **Open the chat:** http://localhost:3000/chat

3. **Send a message** - you should see a response!

## Current Status

✅ **Chat interface** - Working
✅ **Message storage** - Working  
✅ **Google Gemini AI** - FREE (just add API key)
✅ **Mock AI responses** - Working (automatic fallback)
✅ **OpenAI integration** - Available (requires payment)

## Need Help?

- **Get Gemini API Key (FREE)**: https://makersuite.google.com/app/apikey
- **Gemini Documentation**: https://ai.google.dev/docs
- OpenAI Pricing: https://openai.com/pricing
- Check server console for detailed error messages

## Why Gemini?

- ✅ **Completely FREE** - No credit card required
- ✅ **Generous limits** - 60 requests/min, 1.5K/day, 1M/month
- ✅ **High quality** - Comparable to GPT-3.5
- ✅ **Easy setup** - Just sign in with Google
- ✅ **No billing** - Never worry about unexpected charges
