# Deployment Guide

This guide covers deploying the Edau Farm application to both Render and Vercel.

## Application Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **AI Service**: Google Gemini API

## Environment Variables Required

Create these environment variables in your deployment platform:

### Backend Environment Variables
```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Configuration
JWT_SECRET=your_secure_random_jwt_secret

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Cloudinary Configuration
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_URL=https://your-backend-domain.com

# Base URL for links
VITE_BASE_URL=https://your-frontend-domain.com

# Gemini API (if needed in frontend)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Option 1: Deploy to Render

### Backend Deployment

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Service Configuration**
   ```
   Name: edau-farm-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm run server
   ```

3. **Environment Variables**
   - Add all backend environment variables listed above

4. **Database**
   - Ensure MongoDB Atlas is set up and accessible
   - Whitelist Render's IP addresses if needed (0.0.0.0/0 for Atlas)

5. **Deploy**
   - Render will automatically deploy on git push

### Frontend Deployment

1. **Connect Repository**
   - Click "New" → "Static Site"
   - Connect your GitHub repository

2. **Site Configuration**
   ```
   Name: edau-farm-frontend
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Environment Variables**
   - Add frontend environment variables
   - Set `VITE_API_URL` to your Render backend URL

4. **Deploy**
   - Deploy will trigger on git push

## Option 2: Deploy to Vercel

### Full-Stack Deployment (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Project Configuration**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   - Add all environment variables (both frontend and backend)
   - Vercel automatically prefixes client-side vars with `VITE_`

4. **Database Configuration**
   - Ensure MongoDB Atlas connection string is set
   - No IP whitelisting needed for Vercel

5. **Deploy**
   - Vercel will deploy automatically on git push

### Separate Frontend/Backend (Alternative)

If you prefer separate deployments:

#### Backend on Render
- Follow Render backend steps above
- Get the backend URL

#### Frontend on Vercel
1. **Project Setup**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-render-backend-url.com
   VITE_BASE_URL=https://your-vercel-frontend-url.vercel.app
   ```

## Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster

2. **Database User**
   - Create a database user with read/write access

3. **Network Access**
   - Add IP address `0.0.0.0/0` for cloud deployments
   - Or add specific IP ranges for your deployment platforms

4. **Connection String**
   - Get connection string from Atlas
   - Replace `<password>` with your database user password
   - Use this as `MONGODB_URI`

## Cloudinary Setup

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for free account

2. **Get API Credentials**
   - Go to Dashboard → Account → API Keys
   - Copy API Key, API Secret, and Cloud Name

3. **Configure Environment**
   ```
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```

## Gemini AI Setup

1. **Google AI Studio**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key

2. **Environment Variables**
   ```
   GEMINI_API_KEY=your_api_key
   VITE_GEMINI_API_KEY=your_api_key
   ```

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.com/api/health`
- [ ] Frontend loads correctly
- [ ] Database connection works
- [ ] File uploads to Cloudinary work
- [ ] Chat functionality works
- [ ] User authentication works
- [ ] Admin panel accessible

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` matches your frontend domain
   - Check if protocol (http/https) matches

2. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure upload folder permissions

4. **AI Chat Not Working**
   - Verify Gemini API key
   - Check API quota/limits
   - Ensure proper role mapping ('user'/'model')

### Logs and Monitoring

- **Render**: Check service logs in dashboard
- **Vercel**: Use deployment logs and runtime logs
- **MongoDB**: Monitor Atlas dashboard for connections
- **Cloudinary**: Check usage dashboard

## Performance Optimization

1. **Enable Compression**
   - Both platforms support automatic compression

2. **CDN**
   - Vercel has built-in CDN
   - Render can use Cloudflare

3. **Database Indexing**
   - Ensure proper indexes on MongoDB collections

4. **Image Optimization**
   - Use Cloudinary transformations for responsive images

## Security Considerations

- Use HTTPS (both platforms provide this)
- Keep API keys secure in environment variables
- Implement rate limiting if needed
- Regular dependency updates
- Monitor for security vulnerabilities

## Cost Optimization

- **Render**: Free tier for small apps, paid plans for larger usage
- **Vercel**: Generous free tier, pay for usage above limits
- **MongoDB Atlas**: Free tier available, upgrade as needed
- **Cloudinary**: Free tier with 25GB storage, 25GB monthly bandwidth

## Support

- **Render**: [Render Support](https://docs.render.com/)
- **Vercel**: [Vercel Docs](https://vercel.com/docs)
- **MongoDB Atlas**: [Atlas Docs](https://docs.atlas.mongodb.com/)
- **Cloudinary**: [Cloudinary Docs](https://cloudinary.com/documentation)

---

**Last Updated**: October 25, 2025</content>
<parameter name="filePath">/home/mosion/Desktop/plain-react-bliss/DEPLOYMENT.md