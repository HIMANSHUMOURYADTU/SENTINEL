# 🚀 Deployment Guide - SENTINEL Voice Fraud Detection

## Environment Variables Setup

First, create your local `.env` files:

### Backend (Required for both local & production)

Create `backend/.env`:
```
NODE_ENV=production
PORT=10000
```

### Frontend (Vite - Required!)

Create `sentinel-watch/.env`:
```
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**See `backend/.env.example` and `sentinel-watch/.env.example` for templates**

---

## Deployment Options

This guide covers deploying SENTINEL to **Render** (recommended) or **Vercel + Railway/Render**.

---

## Important: Vite Environment Variables

**Vite env vars are compiled at build time**, not loaded at runtime like Node.js:

- **Frontend (`VITE_*`)**: Baked into the built app when you run `npm run build`
  - Must be set BEFORE building
  - Can't be changed without rebuilding
  - Render handles this automatically via postinstall hook

- **Backend (Node.js)**: Loaded at runtime from `.env` file
  - Can be changed by updating Render environment variables
  - Takes effect on next restart

---

Render will host both your backend and frontend together.

### Prerequisites
- GitHub account
- Render account (free tier available at render.com)
- Your repo pushed to GitHub

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - SENTINEL deployment"
git remote add origin https://github.com/YOUR_USERNAME/SENTINEL.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Render

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
2. **Connect GitHub**: Dashboard → Connect Account → Select your SENTINEL repo
3. **Deploy Service**:
   - Click "New +" → Web Service
   - Select your GitHub repository
   - Set these settings:
     - **Name**: `voice-sentinel` (or your preferred name)
     - **Branch**: `main`
     - **Runtime**: `Node`
     - **Build Command**: `cd backend && npm install && npm run build`
     - **Start Command**: `cd backend && npm start`
     - **Instance Type**: `Starter` (free tier - good for testing)

### Step 3: Configure Environment Variables

In Render Dashboard for your service → **Environment** tab, add these variables:

**Backend (Node.js runtime):**
```
NODE_ENV=production
PORT=10000
```

**Frontend (Vite - compiled at build time):**
```
VITE_API_URL=https://voice-sentinel.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

⚠️ **Important**: These must be set BEFORE the first deploy so they get compiled into the frontend during `npm run build`

### Step 4: Deploy!

Render automatically deploys when you push to GitHub. Your app will be available at:
```
https://voice-sentinel.onrender.com
```

### Accessing Your App
- **Frontend**: `https://voice-sentinel.onrender.com`
- **Backend API**: `https://voice-sentinel.onrender.com/api/voice/analyze`
- **Health Check**: `https://voice-sentinel.onrender.com/health`
- **WebSocket**: `wss://voice-sentinel.onrender.com`

---

## **Option 2: Frontend on Vercel + Backend on Render**

If you prefer Vercel for the frontend:

### Deploy Backend to Render (same as Option 1 above)

### Deploy Frontend to Vercel

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com)
2. **Import Project**: Connect your GitHub repo
3. **Select Root Directory**: Set to `sentinel-watch`
4. **Configure Environment Variables** in Vercel dashboard (Vite vars - compiled at build):
   ```
   VITE_API_URL=https://voice-sentinel.onrender.com
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```
5. **Deploy**

**Update Backend CORS** in `backend/app.js`:
```javascript
app.use(cors({
  origin: 'https://your-vercel-app.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
```

---

## **Troubleshooting**

### Build Fails
- Check logs: Render Dashboard → Logs
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Frontend Not Loading
- Clear browser cache
- Check if `sentinel-watch/dist` folder is being created
- Verify file paths are correct

### API Connection Issues
- Check CORS settings in `backend/app.js`
- Verify environment variables are set correctly
- Test health endpoint: `curl https://your-app.onrender.com/health`

### WebSocket Connection Issues
- Use `wss://` (secure WebSocket) for HTTPS sites
- Check firewall/proxy settings
- Verify WebSocket server is running on correct port

---

## **Local Development Setup**

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Backend runs at `http://localhost:8080`

### 2. Frontend Setup

```bash
cd sentinel-watch
cp .env.example .env
# Edit .env with your Firebase credentials and local API URL
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (Vite default)

### Full Integration Test Locally

1. Terminal 1: `cd backend && npm start`
2. Terminal 2: `cd sentinel-watch && npm run dev`
3. Open `http://localhost:5173`

---

## **Database Setup** (If Needed)

If you're using a database:

### For PostgreSQL on Render
1. Render Dashboard → Databases → New PostgreSQL
2. Copy connection string
3. Add to environment variables as `DATABASE_URL`

### For MongoDB
- Use MongoDB Atlas (free tier at mongodb.com)
- Add connection string as `MONGODB_URI`

---

## **Monitoring & Logs**

### View Logs
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab

### Monitor Performance
- Use Render's built-in metrics
- Monitor CPU, Memory, Network usage
- Check error rates and response times

---

## **Scaling & Upgrades**

### When To Upgrade
- Starter (free) has 0.5 CPU, limited bandwidth
- Standard tier recommended for production
- Auto-scaling available on paid plans

### Auto-Deploy Updates
Render automatically redeploys when:
- You push to GitHub main branch
- Environment variables change
- You manually trigger redeploy

---

## **File Structure After Deployment**

```
SENTINEL/
├── backend/
│   ├── app.js (updated to serve frontend)
│   ├── firebase.js
│   ├── voiceEngine.js
│   └── package.json (updated with build script)
├── sentinel-watch/
│   ├── src/
│   ├── dist/ (created during build)
│   ├── package.json
│   └── vite.config.ts
├── .render.yaml (deployment config)
└── README.md
```

---

## **Quick Deployment Checklist**

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Service created in Render
- [ ] Environment variables added
- [ ] Build command: `cd backend && npm install && npm run build`
- [ ] Start command: `cd backend && npm start`
- [ ] Deployment triggered
- [ ] App loads at `https://your-app.onrender.com`
- [ ] API responding at `/api/voice/analyze`
- [ ] Health check passes at `/health`

---

## **Support & Resources**

- **Render Docs**: https://render.com/docs
- **Express.js**: https://expressjs.com
- **Vite**: https://vitejs.dev
- **WebSocket**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

**Happy Deploying! 🚀**
