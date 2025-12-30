Study-Hub

A real‑time Pomodoro and session‑tracking web app with live leaderboards. Originally built in March 2025, publicly deployed now (August 2025).

🛠 Tech Stack

Frontend: React (Vite) · Tailwind CSS · React Router · Axios

Backend: AWS Lambda (Serverless Framework) · API Gateway · DynamoDB · WebSocket API

**Current Production Endpoints:**
- REST API: `https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod`
- WebSocket: `wss://ejmlz5r2zh.execute-api.us-east-1.amazonaws.com/prod`

Local Dev: serverless-offline · AWS CLI

Hosting: Vercel (Free tier)

🚀 Features

Group Collaboration: Create or join study groups in real time.

Session Tracking: Start/pause/stop timers and log focused study sessions.

Pomodoro Mode: Configurable focus/break cycles with automatic transitions.

Live Leaderboard: See who’s studied the most minutes each week.

🔗 Live Demo

Try it out: https://study-hub-lyart.vercel.app

## 💬 Real-Time Chat

The app includes WebSocket-based real-time chat for study groups.

### Setup

#### Backend

1. **Deploy WebSocket API**:
   ```bash
   cd infrastructure
   serverless deploy -v
   ```

2. **After deployment**, note the WebSocket API endpoint from the output:
   ```
   WebsocketsApiEndpoint: wss://<api-id>.execute-api.us-east-1.amazonaws.com/dev
   ```

#### Frontend

1. **Set WebSocket URL** in `.env.local` (for local dev) or your hosting env (Vercel):

   **Local Development:**
   ```env
   VITE_WS_URL=ws://localhost:3001
   ```
   (Check your `serverless offline` output for the actual WebSocket port)

   **Production:**
   ```env
   VITE_WS_URL=wss://ejmlz5r2zh.execute-api.us-east-1.amazonaws.com/prod
   VITE_API_BASE_URL=https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod
   ```
   (Current production endpoints)

### Running Locally

1. **Backend** (Terminal 1):
   ```bash
   cd infrastructure
   serverless offline
   ```
   Note the WebSocket URL printed (usually `ws://localhost:3001`).

2. **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   Make sure `.env.local` has the correct `VITE_WS_URL`.

### Features

- ✅ Real-time messaging within study groups
- ✅ Auto-linking of URLs (safe, opens in new tab)
- ✅ Typing indicators (appears when others are typing)
- ✅ Auto-reconnect with exponential backoff
- ✅ Connection status indicators
- ✅ Message persistence in DynamoDB
- ✅ System notifications (user join/leave)

### Usage

Visit `/group/:groupId` to see the chat panel. Messages are scoped to the group.

## 🚀 Deploying WebSocket Chat to Production

### Prerequisites

- AWS CLI configured with credentials that can deploy (IAM permissions)
- Region: `us-east-1` (as configured in `serverless.yml`)

### Deployment Steps

#### 1. Deploy Backend to AWS

From the project root (where `serverless.yml` is located):

```bash
cd infrastructure
npx serverless deploy -v --stage prod --region us-east-1
```

#### 2. Capture WebSocket Endpoint

After deployment completes, look for the WebSocket API endpoint in the Serverless deploy output:

**Current Production WebSocket Endpoint:**
```
wss://ejmlz5r2zh.execute-api.us-east-1.amazonaws.com/prod
```

**REST API Endpoint:**
```
https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod
```

**Copy the WebSocket URL** - you'll need it for the frontend configuration.

**Deployment Details:**
- AWS Account: `842733143619`
- AWS User: `aws-cli-user` (kousil profile)
- Region: `us-east-1`

**Note:** If the endpoint isn't shown in outputs, check the Serverless deploy logs or CloudFormation console. The WebSocket API ID will be in the format: `abc123xyz0.execute-api.us-east-1.amazonaws.com/prod`

#### 3. Configure Frontend Environment Variables

In **Vercel** (or your hosting platform):

1. Go to **Project Settings → Environment Variables**
2. Add these two variables:

   **Variable 1:**
   - **Key:** `VITE_WS_URL`
   - **Value:** `wss://ejmlz5r2zh.execute-api.us-east-1.amazonaws.com/prod`
   - **Environment:** Production (and Preview if desired)

   **Variable 2:**
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod`
   - **Environment:** Production (and Preview if desired)

3. **Important:** Trigger a fresh build/redeploy so Vercel picks up the new environment variables (Vite only reads env vars at build time)
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment, or push a new commit to trigger a build

#### 4. Verify Deployment

After redeploying the frontend:

1. Open your production site in two different browsers/tabs
2. Navigate to the same group page: `/group/:groupId`
3. Both should show "Connected" status
4. Send a message from one browser - it should appear instantly in the other
5. URLs in messages should be clickable and open in new tabs
6. Typing indicators should appear when someone is typing
7. Hard refresh page - messages should continue to arrive (auto-reconnect works)

### Troubleshooting

#### DynamoDB Permission Errors

If deployment fails with DynamoDB permission errors, verify the IAM Resource ARNs in `serverless.yml`. For `Connections` and `Messages` tables (created by this stack), we use wildcard account:

```yaml
arn:aws:dynamodb:${self:provider.region}:*:table/Connections
arn:aws:dynamodb:${self:provider.region}:*:table/Messages
```

#### ResourceNotFoundException

If you see `ResourceNotFoundException` when posting to connections, ensure:
- You're using the **production WSS URL** (`wss://...`) in production, not the local dev URL
- The WebSocket API endpoint in `VITE_WS_URL` matches the deployed endpoint
- The frontend has been rebuilt after setting the environment variable

### CloudWatch Logs

Monitor WebSocket Lambda functions:

- `wsConnect` - `/aws/lambda/studyhub-backend-prod-wsConnect`
- `wsDisconnect` - `/aws/lambda/studyhub-backend-prod-wsDisconnect`
- `wsSendMessage` - `/aws/lambda/studyhub-backend-prod-wsSendMessage`
- `wsTyping` - `/aws/lambda/studyhub-backend-prod-wsTyping`

### Security Notes

- ✅ Messages are sanitized server-side (no HTML rendering)
- ✅ URLs are auto-linked client-side with safe attributes (`target="_blank" rel="noopener noreferrer nofollow"`)
- ✅ Max message length: 1000 characters (enforced server-side)
- ✅ Control characters and HTML are stripped/escaped server-side
