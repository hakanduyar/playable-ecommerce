# 🚀 Deployment Guide

This guide covers deploying the Playable E-commerce platform to production environments.

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Vercel account (for frontend) or Netlify
- Railway/Heroku account (for backend) or Render

---

## 📊 MongoDB Atlas Setup

### 1. Create Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Create a new cluster (M0 Free tier)
4. Choose a cloud provider and region
5. Wait for cluster to be created (~5 minutes)

### 2. Configure Database Access

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose authentication method: **Password**
4. Username: `playable_user`
5. Password: Generate secure password (save it!)
6. Database User Privileges: **Atlas admin**
7. Click "Add User"

### 3. Configure Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 4. Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js** version **5.5 or later**
5. Copy the connection string:
```
mongodb+srv://playable_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
6. Replace `<password>` with your actual password
7. Add database name: `/playable-ecommerce`

Final connection string:
```
mongodb+srv://playable_user:YourPassword@cluster0.xxxxx.mongodb.net/playable-ecommerce?retryWrites=true&w=majority
```

---

## 🔙 Backend Deployment (Railway)

### 1. Prepare for Deployment

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "postbuild": "npm run seed"
  }
}
```

### 2. Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Click "Deploy from GitHub repo"
5. Select your repository
6. Railway will auto-detect Node.js

### 3. Configure Environment Variables

In Railway dashboard, go to Variables tab:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://playable_user:YourPassword@cluster0.xxxxx.mongodb.net/playable-ecommerce?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-production-key-min-32-characters
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
ADMIN_EMAIL=admin@playable.com
ADMIN_PASSWORD=Admin@123
```

### 4. Deploy

1. Railway will automatically deploy
2. Get your backend URL: `https://your-app.railway.app`
3. Test API: `https://your-app.railway.app/health`

---

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare for Deployment

Ensure `next.config.js` is correct:
```javascript
module.exports = {
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}
```

### 2. Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Environment Variables

Add in Vercel dashboard:
```env
NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
```

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Get your frontend URL: `https://your-app.vercel.app`

### 5. Update Backend CORS

Go back to Railway and update `FRONTEND_URL`:
```env
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy backend if needed.

---

## 🔄 Alternative Deployment Options

### Backend Alternatives

#### Render.com
1. Connect GitHub repository
2. Select "Web Service"
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add environment variables

#### Heroku
```bash
heroku create playable-backend
heroku config:set MONGODB_URI=your_connection_string
git push heroku main
```

### Frontend Alternatives

#### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

---

## 🗄️ Database Seeding in Production

### Option 1: Automatic Seeding (First Deploy)

Add to `package.json`:
```json
{
  "scripts": {
    "postbuild": "node dist/scripts/seed.js"
  }
}
```

### Option 2: Manual Seeding

SSH into your server or use Railway CLI:
```bash
npm run seed
```

### Option 3: MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect with your connection string
3. Manually insert sample data

---

## 🔒 Security Checklist

### Before Deployment

- [ ] Change `JWT_SECRET` to a strong, random string (min 32 characters)
- [ ] Change admin password
- [ ] Enable CORS only for your frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Review and update MongoDB network access rules
- [ ] Add custom domain (optional)
- [ ] Enable HTTPS (automatic on Vercel/Railway)

### Environment Variables Security

**Never commit these to Git:**
- `.env`
- `.env.local`
- `.env.production`

**Always use:**
- Platform-specific environment variable managers
- GitHub Secrets for CI/CD

---

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-19T..."
}
```

### 2. Frontend Access

Visit: `https://your-frontend.vercel.app`

- [ ] Homepage loads
- [ ] Products display
- [ ] Login works
- [ ] Registration works
- [ ] Add to cart works
- [ ] Checkout works
- [ ] Admin dashboard accessible

### 3. Database Check

1. Login to MongoDB Atlas
2. Browse Collections
3. Verify data exists:
   - users
   - products
   - categories
   - orders

---

## 📊 Monitoring

### Railway

- View logs in real-time
- Monitor resource usage
- Set up alerts

### Vercel

- View deployment logs
- Monitor build times
- Analytics dashboard

### MongoDB Atlas

- Monitor database performance
- View connection metrics
- Set up alerts for high usage

---

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:

1. Push code to GitHub
2. Platforms detect changes
3. Automatic build and deploy
4. Zero downtime deployment

### Branch Strategy

- `main` branch → Production
- `develop` branch → Staging (optional)
- Feature branches → Preview deployments (Vercel)

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
railway logs
```

**Common issues:**
- MongoDB connection string incorrect
- Missing environment variables
- Build errors

### Frontend Build Fails

**Common issues:**
- API URL not set correctly
- TypeScript errors
- Missing dependencies

**Fix:**
```bash
npm run build
# Check for errors locally first
```

### Database Connection Issues

**Check:**
- Connection string format
- Password special characters (URL encode if needed)
- IP whitelist includes 0.0.0.0/0
- Database user has correct permissions

---

## 📞 Support

For deployment issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Deployment complete! 🎉**