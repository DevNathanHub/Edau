# 🌾 Edau Farm - West Pokot's Premier Sustainable Farm

Welcome to **Edau Farm**, a locally-run sustainable agricultural enterprise located in the heart of West Pokot, Kenya. We specialize in producing premium Acacia honey, fresh seasonal fruits, premium Dorper sheep, and free-range poultry — all raised with traditional wisdom and modern sustainable practices.

## 🏡 About Edau Farm

Founded in 2015, Edau Farm has been committed to sustainable agriculture that honors our ancestral lands while embracing eco-friendly farming methods. Our farm produces:

- **🌸 Acacia Honey** - Pure, raw honey harvested from the rich Acacia forests of West Pokot
- **🍎 Seasonal Fruits** - Fresh, organic fruits grown in our fertile orchards
- **🐑 Dorper Sheep** - Premium breeding stock known for rapid growth and excellent meat quality
- **🐔 Free-Range Poultry** - Humanely raised chickens producing natural eggs and meat

## 🎨 Design System

### Primary Colors
- **Farm Green** `#4CAF50` - Represents crops, freshness, and sustainable farming
- **Honey Gold** `#FFC107` - Rich, golden honey color for premium products

### Secondary Colors (Earth & Nature)
- **Soil Brown** `#8D6E63` - Earth tone for backgrounds, cards, or text contrast
- **Cream White** `#FFF8E1` - Light organic base color for section backgrounds
- **Leaf Accent** `#81C784` - Fresh, bright green accent for icons or hover states

## 🚀 Features

- **🤖 AI Farm Assistant** - 24/7 intelligent chat support for product inquiries, orders, and farm visits
- **📱 Responsive Design** - Optimized for all devices with Pinterest-style gallery
- **🛒 E-commerce Platform** - Complete online ordering and payment system
- **📅 Farm Visit Booking** - Schedule guided tours of our sustainable operations
- **👨‍💼 Admin Dashboard** - Comprehensive management tools for farm operations
- **📊 Analytics & Reporting** - Real-time insights into farm performance

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express.js, MongoDB with optimized connection pooling
- **Caching**: Redis for high-performance data caching
- **Authentication**: JWT with role-based access
- **File Storage**: Cloudinary for image management
- **AI Integration**: Google Gemini for intelligent chat assistance
- **Security**: Helmet.js, rate limiting, CORS protection
- **Logging**: Winston with Morgan for comprehensive request tracking
- **Performance**: Response compression, request timeouts, health monitoring

## ⚡ Server Optimizations

### 🚀 Performance Enhancements

#### Redis Caching Layer
- **Multi-level caching**: Products, categories, analytics, and user data
- **Cache TTL management**: Optimized expiration times (5-30 minutes)
- **Cache invalidation**: Automatic cache clearing on data updates
- **Fallback support**: Graceful degradation when Redis is unavailable

#### MongoDB Optimization
- **Connection pooling**: 2-10 connections with automatic scaling
- **Read preferences**: Secondary-preferred reads for better performance
- **Optimized indexes**: Compound indexes for complex queries
- **Aggregation pipelines**: Efficient analytics and reporting queries

#### Response Optimization
- **Gzip compression**: Automatic compression for responses >1KB
- **HTTP caching headers**: Browser caching for static content
- **Pagination**: Efficient handling of large datasets
- **Request timeouts**: 30-second timeout protection

### 🔒 Security & Reliability

#### Advanced Rate Limiting
- **Global limits**: 1000 requests per 15 minutes per IP
- **API-specific limits**: 500 requests per 15 minutes for API endpoints
- **Auth throttling**: 10 login attempts per 15 minutes
- **Speed limiting**: Progressive delays for repeated requests

#### Security Headers (Helmet.js)
- **Content Security Policy**: XSS protection with allowed domains
- **HSTS**: HTTP Strict Transport Security for HTTPS enforcement
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing prevention

#### Monitoring & Logging
- **Structured logging**: Winston with file and console outputs
- **Performance monitoring**: Request timing and slow query detection
- **Health checks**: Comprehensive system health monitoring
- **Error tracking**: Detailed error logging with stack traces

### 📊 Performance Metrics

#### Health Check Endpoint (`/api/health`)
```json
{
  "status": "OK",
  "services": {
    "database": { "status": "healthy", "collections": 12 },
    "cache": { "status": "connected" }
  },
  "uptime": 3600,
  "performance": {
    "avgResponseTime": 45.2
  }
}
```

#### Metrics Endpoint (`/api/metrics`) - Admin Only
- Real-time performance statistics
- Database connection status
- Cache hit/miss ratios
- Memory usage and uptime

### 🔧 Configuration

#### Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://...

# Redis (Optional - graceful fallback if not available)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secure-secret-key

# AI
GEMINI_API_KEY=your-gemini-api-key

# Logging
LOG_LEVEL=info

# Server
PORT=3001
NODE_ENV=production
```

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Cloudinary account (for image uploads)

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd edau-farm

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-jwt-secret-key

# API
VITE_API_URL=http://localhost:3001/api

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🏗️ Project Structure

```
edau-farm/
├── public/                 # Static assets
│   ├── honeycomb.svg      # Honeycomb pattern SVG
│   └── favicon.ico
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities and API
│   └── types.ts          # TypeScript definitions
├── server/                # Backend server
│   ├── server.ts         # Main server file
│   └── scripts/          # Database seeding scripts
└── package.json
```

## 🌐 Deployment

### Frontend Deployment
```bash
npm run build
npm run preview
```

### Backend Deployment
```bash
npm run build:backend
```

### Full Stack Deployment
The application is configured for deployment on platforms like Vercel, Netlify, or Railway.

## 📞 Contact & Support

- **Location**: West Pokot, Kenya
- **Phone**: +254 727 690 165
- **Email**: info@edaufarm.com
- **Website**: [edau.loopnet.tech](https://edau.loopnet.tech)

## 🤝 Contributing

We welcome contributions to improve Edau Farm's digital presence. Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Edau Farm - Where Tradition Meets Sustainability* 🌾
