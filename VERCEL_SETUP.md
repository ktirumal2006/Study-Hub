# Vercel Environment Variables Setup

## Required Environment Variables

Set these in **Vercel → Project Settings → Environment Variables**:

### 1. WebSocket URL
- **Key:** `VITE_WS_URL`
- **Value:** `wss://ejmlz5r2zh.execute-api.us-east-1.amazonaws.com/prod`
- **Environment:** Production, Preview, Development

### 2. REST API Base URL (Optional - already set as default in code)
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod`
- **Environment:** Production, Preview, Development

## Steps to Configure

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add both variables above
4. **Important:** After adding variables, trigger a new deployment:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment, OR
   - Push a new commit to trigger automatic deployment

## Verification

After redeploying, check the browser console on your production site:
- Should see: `🔗 API base URL: https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod`
- Chat should show "Connected" status
- Messages should send/receive in real-time

## Current Production Endpoints

- **REST API:** `https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod`
- **WebSocket:** `wss://ejmlz5r2zh.execute-api.us-east-1.amazonaws.com/prod`
- **AWS Account:** `842733143619`
- **Region:** `us-east-1`

