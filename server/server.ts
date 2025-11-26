import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import compression from 'compression';
import helmet from 'helmet';
import multer from 'multer';
import cloudinary from './cloudinary';

// Import our optimized services
import { cacheService } from './cache.js';
import { databaseService } from './database.js';
import { logger, morganMiddleware, performanceMonitor, requestTimer } from './logger.js';

// Load environment variables
dotenv.config();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://chapinin777:CzvFbEsIpBeKaGDx@cluster0.hxakj.mongodb.net/edauDB';
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';

let db: any = null;

// Auth utilities
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Auth middleware
interface AuthedRequest extends Request {
  user?: any;
  file?: any;
}

const verifyToken = (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminOnly = (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  return next();
};

// Helper to serialize MongoDB documents (convert _id to id)
const serializeDoc = (doc: any) => {
  if (!doc) return doc;
  const { _id, password, ...rest } = doc;
  return { id: _id?.toString?.() || _id, ...rest };
};

const upload = multer({ storage: multer.memoryStorage() });

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Security middleware - applied first for performance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://edau.loopnet.tech"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression middleware - applied early to compress all responses
app.use(compression() as any);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://edau.loopnet.tech', 'https://www.edau.loopnet.tech']
    : ['http://localhost:5173', 'http://172.17.88.218', 'http://localhost:5174', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request timeout middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Set timeout for all requests (30 seconds)
  req.setTimeout(30000, () => {
    logger.warn('Request timeout', { url: req.url, method: req.method });
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Logging middleware
app.use(morganMiddleware as any);

// Performance monitoring
app.use(requestTimer);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/api/health';
  }
});

// Speed limiting - Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes without delay
  delayMs: (used: number, req?: Request): number => {
    return 500; // add 500ms of delay per request after delayAfter
  },
  validate: { delayMs: false } // Disable the warning
});

// API specific rate limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 API requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'API rate limit exceeded',
    retryAfter: '15 minutes'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Apply rate limiting
app.use(globalLimiter);
app.use(speedLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Basic routes
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    const cacheHealth = cacheService ? { status: 'connected' } : { status: 'disconnected' };
    const metrics = performanceMonitor.getMetrics();

    res.set({
      'Cache-Control': 'no-cache',
      'X-Response-Time': `${Date.now() - (req as any).startTime}ms`
    });

    res.json({
      status: dbHealth.status === 'healthy' ? 'OK' : 'DEGRADED',
      message: 'Backend server is running with optimized services',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth,
        cache: cacheHealth,
        performance: metrics
      },
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Performance metrics endpoint (admin only)
app.get('/api/metrics', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    const dbStats = await databaseService.healthCheck();

    res.json({
      performance: metrics,
      database: dbStats,
      cache: {
        connected: cacheService ? true : false
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Products API - Optimized with caching
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const { page = '1', limit = '20', category, search, minPrice, maxPrice, inStock, sort = 'created_at' } = req.query as any;

    const cacheKey = `products:${JSON.stringify({ page, limit, category, search, minPrice, maxPrice, inStock, sort })}`;

    // Try to get from cache first
    let cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      logger.info('Products served from cache', { cacheKey, responseTime: Date.now() - startTime });
      return res.set({
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=300'
      }).json(cachedResult);
    }

    // Build filter
    const filter: any = {};
    if (category && category !== 'all') filter.category = category;
    if (search) filter.search = search;
    if (minPrice !== undefined) filter.minPrice = parseFloat(minPrice);
    if (maxPrice !== undefined) filter.maxPrice = parseFloat(maxPrice);
    if (inStock !== undefined) filter.inStock = inStock === 'true';

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Get products and count in parallel
    const [products, total] = await Promise.all([
      databaseService.getProducts(filter, {
        skip,
        limit: limitNum,
        sort: sort === 'price_asc' ? { price: 1 } :
              sort === 'price_desc' ? { price: -1 } :
              sort === 'name' ? { name: 1 } : { created_at: -1 }
      }),
      databaseService.getProductsCount(filter)
    ]);

    const result = {
      data: products.map(serializeDoc),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      message: 'Products fetched successfully'
    };

    // Cache the result
    await cacheService.set(cacheKey, result, (cacheService.constructor as any).ttls.products);

    logger.info('Products fetched from database', {
      count: products.length,
      total,
      responseTime: Date.now() - startTime
    });

    res.set({
      'X-Cache': 'MISS',
      'Cache-Control': 'public, max-age=300'
    }).json(result);

  } catch (error) {
    logger.error('Products fetch error', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/products', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    const db = databaseService.getDb();
    const product = req.body;
    const result = await db.collection('products').insertOne({
      ...product,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Invalidate products cache
    await cacheService.invalidatePattern('products:*');

    res.json({
      data: { id: result.insertedId.toString(), ...product },
      message: 'Product created successfully'
    });
  } catch (error) {
    logger.error('Product creation error', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update product
app.patch('/api/products/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    const db = databaseService.getDb();
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date() };
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const result = await db.collection('products').findOneAndUpdate(query, { $set: updates }, { returnDocument: 'after' });
    if (!result || !result.value) return res.status(404).json({ error: 'Product not found' });

    // Invalidate cache
    await cacheService.invalidatePattern('products:*');
    await cacheService.del(`product:${id}`);

    res.json({ data: serializeDoc(result.value), message: 'Product updated successfully' });
  } catch (error) {
    logger.error('Product update error', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete product
app.delete('/api/products/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    const db = databaseService.getDb();
    const { id } = req.params;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const result = await db.collection('products').deleteOne(query);
    if (!result.deletedCount) return res.status(404).json({ error: 'Product not found' });

    // Invalidate cache
    await cacheService.invalidatePattern('products:*');
    await cacheService.del(`product:${id}`);

    res.json({ data: { id }, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Product deletion error', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get single product by id - Optimized with caching
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    // Try cache first
    let cachedProduct = await cacheService.get(cacheKey);
    if (cachedProduct) {
      return res.set({
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=600'
      }).json(cachedProduct);
    }

    // Get from database
    const product = await databaseService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = { data: serializeDoc(product), message: 'Product fetched successfully' };

    // Cache the result
    await cacheService.set(cacheKey, result, (cacheService.constructor as any).ttls.product);

    res.set({
      'X-Cache': 'MISS',
      'Cache-Control': 'public, max-age=600'
    }).json(result);

  } catch (error) {
    logger.error('Single product fetch error', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Orders API
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { userId, user_id } = req.query as { userId?: string; user_id?: string };
    const filter: any = {};
    const uid = userId || user_id;
    if (uid) {
      filter.user_id = uid;
    }
    const orders = await db!.collection('orders').find(filter).sort({ created_at: -1 }).toArray();
    const data = orders.map(serializeDoc);
    res.json({ 
      data,
      total: orders.length,
      message: 'Orders fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const order = req.body;
    const result = await db!.collection('orders').insertOne({
      ...order,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.json({ 
      data: { id: result.insertedId.toString(), ...order },
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Users submit MPesa transaction ID for an order (delayed/manual processing)
app.post('/api/orders/:id/mpesa-transaction', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    const { transaction_id, phone, amount } = req.body as any;
    const userId = req.user?.userId;

    if (!transaction_id || typeof transaction_id !== 'string') return res.status(400).json({ error: 'transaction_id is required' });
    const tid = transaction_id.trim();
    if (tid.length < 6 || tid.length > 20) return res.status(400).json({ error: 'transaction_id length looks invalid' });

    let query: any;
    try { query = { _id: new ObjectId(id) }; } catch { query = { _id: id }; }

    const order = await db!.collection('orders').findOne(query);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Ensure only owner or admin can submit (owner or admin via token role)
    if (order.user_id && userId && order.user_id.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const update: any = {
      mpesa_transaction_id: tid,
      mpesa_transaction_submitted_at: new Date(),
      mpesa_transaction_submitted_by: userId || null,
      mpesa_payment_status: 'pending_verification',
      updated_at: new Date()
    };
    if (phone) update.mpesa_phone = phone;
    if (amount) update.mpesa_claimed_amount = Number(amount) || null;

    await db!.collection('orders').updateOne(query, { $set: update });

    // Optionally record a payment attempt for admin visibility
    try {
      await db!.collection('payments').insertOne({
        order_id: id,
        provider: 'mpesa_manual_submission',
        transaction_id: tid,
        phone: phone || null,
        amount: amount || null,
        status: 'submitted',
        submitted_by: userId || null,
        created_at: new Date()
      });
    } catch (err) {
      logger.error('Failed to persist manual mpesa submission', err);
    }

    res.json({ message: 'Transaction submitted, pending admin verification' });
  } catch (err) {
    logger.error('MPesa transaction submission error', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Payments - STK Push integration with Lipia (MPesa)
// POST /api/payments/stk-push
app.post('/api/payments/stk-push', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { phone_number, phoneNumber, phone, amount, external_reference, callback_url, metadata } = req.body as any;

    const rawPhone = phone_number || phoneNumber || phone;
    if (!rawPhone) return res.status(400).json({ success: false, status: 'error', message: 'phone_number is required' });

    // Normalize Kenyan phone numbers into MSISDN form: 2547XXXXXXXX or 2541XXXXXXXX (12 digits)
    const normalizePhone = (p: string) => {
      if (!p) return p;
      // Remove whitespace, dashes, parentheses and plus signs
      let cleaned = p.toString().trim().replace(/[\s\-()]/g, '');
      if (cleaned.startsWith('+')) cleaned = cleaned.replace(/^\+/, '');
      // Remove any non-digit characters
      cleaned = cleaned.replace(/\D/g, '');

      // If starts with 0 and length 10 -> 07xxxxxxxx or 01xxxxxxxx -> 2547xxxx... or 2541xxxx...
      if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return '254' + cleaned.slice(1);
      }
      // If starts with 7 and length 9 -> 7xxxxxxxx -> 2547xxxxxxxx
      if (cleaned.length === 9 && cleaned.startsWith('7')) {
        return '254' + cleaned;
      }
      // If starts with 1 and length 9 -> 1xxxxxxxx -> 2541xxxxxxxx (some numbering)
      if (cleaned.length === 9 && cleaned.startsWith('1')) {
        return '254' + cleaned;
      }
      // If already starts with country code 254 and correct length (12)
      if (cleaned.startsWith('254') && cleaned.length === 12) {
        return cleaned;
      }
      // If starts with country code but has leading zeros trimmed, try to normalize
      if (cleaned.startsWith('254') && cleaned.length === 11) {
        // unlikely, but return as-is
        return cleaned;
      }
      // Fallback: return cleaned (caller will validate length)
      return cleaned;
    };

    const normalizedPhone = normalizePhone(rawPhone);

    // Validate normalized phone: require Kenyan MSISDN 12 digits starting with 254
    if (!/^[0-9]{12}$/.test(normalizedPhone) || !normalizedPhone.startsWith('254')) {
      return res.status(400).json({ success: false, status: 'error', message: 'Invalid phone format. Expected Kenyan MSISDN like 2547XXXXXXXX or 2541XXXXXXXX' });
    }

    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) return res.status(400).json({ success: false, status: 'error', message: 'amount must be a positive integer' });

    const payload: any = {
      // Include both keys for backward compatibility with different provider shapes
      phone_number: normalizedPhone,
      msisdn: normalizedPhone,
      amount: amt
    };
    if (external_reference) payload.external_reference = external_reference;
    if (callback_url) payload.callback_url = callback_url;
    if (metadata) payload.metadata = metadata;

    const LIPIA_API_KEY = process.env.LIPIA_API_KEY;
    if (!LIPIA_API_KEY) return res.status(500).json({ success: false, status: 'error', message: 'Payment provider not configured' });

    // Send the STK push to Lipia and capture the raw response for better diagnostics
    let lipiaRes;
    try {
      logger.info('Sending STK push to Lipia', { url: 'https://lipia-api.kreativelabske.com/api/v2/payments/stk-push', payload });
      lipiaRes = await fetch('https://lipia-api.kreativelabske.com/api/v2/payments/stk-push', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LIPIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      logger.error('Failed to reach Lipia API', err);
      return res.status(502).json({ success: false, status: 'error', message: 'Failed to reach payment provider' });
    }

    // Read response as text then try to parse JSON (providers sometimes return non-JSON)
    const lipiaText = await lipiaRes.text().catch(() => '');
    let result: any = null;
    try {
      result = lipiaText ? JSON.parse(lipiaText) : null;
    } catch (err) {
      result = { __raw: lipiaText };
    }

    if (!lipiaRes.ok) {
      logger.warn('Lipia responded with non-OK status', { status: lipiaRes.status, body: result });
    }

    // Persist payment attempt
    const paymentDoc: any = {
      phone: normalizedPhone,
      amount: amt,
      external_reference: external_reference || null,
      callback_url: callback_url || null,
      metadata: metadata || null,
      provider_response: result || null,
      status: (result && result.success) ? 'initiated' : 'failed',
      created_at: new Date()
    };

    try {
      const insert = await db!.collection('payments').insertOne(paymentDoc);
      paymentDoc._id = insert.insertedId;
    } catch (err) {
      logger.error('Failed to persist payment record', err);
    }

    // If this STK Push was initiated for an order (external_reference), attach mpesa phone and payment attempt id to order
    if (external_reference) {
      try {
        let orderQuery: any;
        try {
          orderQuery = { _id: new ObjectId(external_reference) };
        } catch {
          orderQuery = { _id: external_reference };
        }
        const orderUpdate: any = {
          mpesa_phone: normalizedPhone,
          payment_method: 'mpesa_lipia',
          payment_attempt_id: paymentDoc._id,
          updated_at: new Date()
        };
        await db!.collection('orders').updateOne(orderQuery, { $set: orderUpdate });
      } catch (err) {
        logger.error('Failed to attach mpesa phone to order', err);
      }
    }

    if (lipiaRes.ok && result && (result.success === true || result.data)) {
      return res.json({ success: true, status: 'success', message: 'STK push initiated successfully', data: result.data || result });
    }

    // Try to extract provider error details
    const providerError = result?.error || result?.message || result?.__raw || null;
    logger.warn('STK push failed', { lipiaStatus: lipiaRes.status, providerError });

    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'M-Pesa STK push failed',
      error: {
        code: 'MPESA_ERROR',
        mpesaError: providerError,
        originalStatus: lipiaRes.status
      }
    });

  } catch (error) {
    logger.error('STK Push error', error);
    return res.status(500).json({ success: false, status: 'error', message: 'Internal server error' });
  }
});

// Callback endpoint for Lipia to post payment updates
// POST /api/payments/lipia/callback
app.post('/api/payments/lipia/callback', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const payload = req.body;

    // Save raw callback for auditing
    const cbDoc = {
      provider: 'lipia',
      payload,
      headers: req.headers,
      received_at: new Date()
    } as any;

    await db!.collection('payment_callbacks').insertOne(cbDoc);

    // Determine success from common shapes
    const txRef = payload?.data?.TransactionReference || payload?.TransactionReference || payload?.data?.transaction_reference || payload?.transaction_reference || null;
    const extRef = payload?.data?.external_reference || payload?.external_reference || payload?.data?.metadata?.order_id || payload?.data?.metadata?.orderId || null;
    const responseCode = payload?.data?.ResponseCode ?? payload?.ResponseCode ?? null;
    const responseDesc = payload?.data?.ResponseDescription ?? payload?.ResponseDescription ?? '';
    const successFlag = payload?.success === true || (responseCode !== null && Number(responseCode) === 0) || (/success/i).test(responseDesc);

    // Try to correlate payment record
    const query: any = {};
    if (txRef) query['provider_response.data.TransactionReference'] = txRef;
    if (extRef) query['external_reference'] = extRef;

    let paymentRecord: any = null;
    if (Object.keys(query).length) {
      try {
        paymentRecord = await db!.collection('payments').findOne(query);
        await db!.collection('payments').updateOne(query, { $set: { provider_callback: payload, status: successFlag ? 'completed' : 'failed', updated_at: new Date() } });
      } catch (err) {
        logger.error('Failed to update payment record from callback', err);
      }
    }

    // If the callback indicates success, attempt to mark the corresponding order as paid and create a receipt
    if (successFlag) {
      try {
        // Determine order id: prefer external_reference / metadata.order_id
        const orderId = extRef || payload?.data?.metadata?.order_id || payload?.data?.metadata?.orderId || null;

        // Determine amount and phone from payload if available
        const amount = payload?.data?.Amount || payload?.data?.amount || paymentRecord?.amount || null;
        const phone = payload?.data?.MSISDN || payload?.data?.phone_number || paymentRecord?.phone || null;

        // If we have an order id, update order status to paid
        if (orderId) {
          let orderQuery: any;
          try {
            orderQuery = { _id: new ObjectId(orderId) };
          } catch {
            orderQuery = { _id: orderId };
          }
          const order = await db!.collection('orders').findOne(orderQuery);
          if (order) {
            await db!.collection('orders').updateOne(orderQuery, { $set: { status: 'paid', paid_at: new Date(), updated_at: new Date() } });

            // Create receipt
            const receipt: any = {
              order_id: orderId,
              payment_id: paymentRecord?._id || null,
              transaction_reference: txRef || null,
              amount: amount || paymentRecord?.amount || null,
              total_paid: amount || paymentRecord?.amount || null,
              phone: phone || paymentRecord?.phone || null,
              provider: 'lipia',
              provider_payload: payload,
              created_at: new Date()
            };
            const r = await db!.collection('receipts').insertOne(receipt);

            // Link receipt id to order
            await db!.collection('orders').updateOne(orderQuery, { $set: { receipt_id: r.insertedId, updated_at: new Date() } });
          }
        }

      } catch (err) {
        logger.error('Error handling successful payment callback', err);
      }
    }

    // Lipia expects a quick plain-text `ok` response
    res.status(200).type('text/plain').send('ok');
  } catch (error) {
    logger.error('Payment callback handling error', error);
    res.status(500).json({ success: false, message: 'Callback handling failed' });
  }
});

// GET /api/payments/status?reference=TRANSACTION_REFERENCE
app.get('/api/payments/status', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const reference = (req.query.reference as string) || (req.query.ref as string) || null;
    if (!reference) return res.status(400).json({ success: false, status: 'error', message: 'reference query param is required' });

    const LIPIA_API_KEY = process.env.LIPIA_API_KEY;
    if (!LIPIA_API_KEY) return res.status(500).json({ success: false, status: 'error', message: 'Payment provider not configured' });

    const url = `https://lipia-api.kreativelabske.com/api/v2/payments/status?reference=${encodeURIComponent(reference)}`;
    let lipiaRes;
    try {
      logger.info('Fetching payment status from Lipia', { url });
      lipiaRes = await fetch(url, { headers: { 'Authorization': `Bearer ${LIPIA_API_KEY}` } });
    } catch (err) {
      logger.error('Failed to reach Lipia status API', err);
      return res.status(502).json({ success: false, status: 'error', message: 'Failed to reach payment provider' });
    }

    const text = await lipiaRes.text().catch(() => '');
    let payload: any = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = { __raw: text }; }

    if (!lipiaRes.ok) {
      return res.status(lipiaRes.status).json({ success: false, status: 'error', message: 'Provider returned error', error: payload });
    }

    return res.json(payload);
  } catch (err) {
    logger.error('Payment status check error', err);
    return res.status(500).json({ success: false, status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Admin: list all orders (paginated) - admin only
app.get('/api/admin/orders', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { page = '1', limit = '20', status, search } = req.query as any;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [ { name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { orderId: { $regex: search, $options: 'i' } } ];

    const total = await db!.collection('orders').countDocuments(filter);
    const orders = await db!.collection('orders').find(filter).sort({ created_at: -1 }).skip(skip).limit(limitNum).toArray();

    res.json({ data: orders.map(serializeDoc), pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }, message: 'Orders fetched' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Admin: update order status and optionally create receipt
app.patch('/api/admin/orders/:id/status', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    const { status, note, createReceipt } = req.body as any; // createReceipt: { transaction_reference, amount, phone }

    if (!status) return res.status(400).json({ error: 'status is required' });

    let query: any;
    try { query = { _id: new ObjectId(id) }; } catch { query = { _id: id }; }

    const updates: any = { status, updated_at: new Date() };
    if (note) updates.note = note;

    const result = await db!.collection('orders').findOneAndUpdate(query, { $set: updates }, { returnDocument: 'after' });
    if (!result || !result.value) return res.status(404).json({ error: 'Order not found' });

    // If admin marks paid and asked to create receipt
    if (status.toLowerCase() === 'paid' && createReceipt && typeof createReceipt === 'object') {
      const receipt = {
        order_id: id,
        payment_id: null,
        transaction_reference: createReceipt.transaction_reference || null,
        amount: createReceipt.amount || null,
        total_paid: createReceipt.amount || null,
        phone: createReceipt.phone || null,
        provider: createReceipt.provider || 'manual',
        provider_payload: createReceipt.provider_payload || null,
        created_at: new Date()
      };
      const r = await db!.collection('receipts').insertOne(receipt);
      await db!.collection('orders').updateOne(query, { $set: { receipt_id: r.insertedId, updated_at: new Date() } });
    }

    res.json({ data: serializeDoc(result.value), message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Receipts - admin endpoints
app.get('/api/receipts', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { page = '1', limit = '20', order_id } = req.query as any;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (order_id) filter.order_id = order_id;

    const total = await db!.collection('receipts').countDocuments(filter);
    const receipts = await db!.collection('receipts').find(filter).sort({ created_at: -1 }).skip(skip).limit(limitNum).toArray();
    res.json({ data: receipts.map(serializeDoc), pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }, message: 'Receipts fetched' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get('/api/receipts/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    let query: any;
    try { query = { _id: new ObjectId(id) }; } catch { query = { _id: id }; }
    const receipt = await db!.collection('receipts').findOne(query);
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    res.json({ data: serializeDoc(receipt), message: 'Receipt fetched' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Update order status or fields
app.patch('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date() };
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const result = await db!.collection('orders').findOneAndUpdate(
      query,
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result || !result.value) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ data: serializeDoc(result.value), message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete order
app.delete('/api/orders/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const result = await db!.collection('orders').deleteOne(query);
    if (!result.deletedCount) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: { id }, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Auth API
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    console.log('Login request received:', req.body);
    
    if (!db) throw new Error('Database not connected');
    
    const { email, password } = req.body;
    
    console.log('Extracted fields:', { email, password: password ? '***' : undefined });
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await db!.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const role = (user as any).role || 'user';
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role,
      first_name: (user as any).first_name || '',
      last_name: (user as any).last_name || ''
    });
    
    res.json({ 
      data: { 
        token, 
        user: { 
          _id: user._id, 
          email: user.email, 
          first_name: (user as any).first_name || '',
          last_name: (user as any).last_name || '',
          role
        } 
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', req.body);
    
    if (!db) throw new Error('Database not connected');
    
    const { email, password, first_name, last_name } = req.body;
    
    console.log('Extracted fields:', { email, password: password ? '***' : undefined, first_name, last_name });
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const existingUser = await db!.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const result = await db!.collection('users').insertOne({
      email,
      password: hashedPassword,
      first_name: first_name || '',
      last_name: last_name || '',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const token = generateToken({ userId: result.insertedId, email, role: 'user', first_name: first_name || '', last_name: last_name || '' });
    
    res.json({ 
      data: { 
        token, 
        user: { 
          _id: result.insertedId, 
          email, 
          first_name: first_name || '',
          last_name: last_name || '',
          role: 'user'
        } 
      },
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Current user endpoint
app.get('/api/auth/me', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    let query: any;
    try {
      query = { _id: new ObjectId(userId) };
    } catch {
      query = { _id: userId };
    }
    const user = await db!.collection('users').findOne(query, { projection: { password: 0 } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const role = (user as any).role || 'user';
    return res.json({ data: { id: (user as any)._id?.toString?.() || (user as any)._id, email: (user as any).email, first_name: (user as any).first_name || '', last_name: (user as any).last_name || '', role }, message: 'Current user' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Example admin-only route
app.get('/api/admin/ping', verifyToken, adminOnly, (req: AuthedRequest, res: Response) => {
  return res.json({ data: { pong: true, at: new Date().toISOString() }, message: 'Admin access granted' });
});

// Users API (profile and admin management)
// List all users (admin only)
app.get('/api/users', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const users = await db!.collection('users').find({}, { projection: { password: 0 } }).sort({ created_at: -1 }).toArray();
    const data = users.map(serializeDoc);
    res.json({ data, total: users.length, message: 'Users fetched successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const user = await db!.collection('users').findOne(query, { projection: { password: 0 } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: serializeDoc(user), message: 'User fetched successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    const { first_name, last_name, phone, address, role, status } = req.body;
    const updates: any = { first_name, last_name, phone, address, updated_at: new Date() };
    if (role) updates.role = role;
    if (status) updates.status = status;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const result = await db!.collection('users').findOneAndUpdate(
      query,
      { $set: updates },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    if (!result || !result.value) return res.status(404).json({ error: 'User not found' });
    res.json({ data: serializeDoc(result.value), message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const result = await db!.collection('users').deleteOne(query);
    if (!result.deletedCount) return res.status(404).json({ error: 'User not found' });
    res.json({ data: { id }, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Contact messages API
app.get('/api/contact', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const messages = await db!.collection('contact_messages').find({}).toArray();
    res.json({ 
      data: messages,
      total: messages.length,
      message: 'Contact messages fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const message = req.body;
    const result = await db!.collection('contact_messages').insertOne({
      ...message,
      created_at: new Date()
    });
    
    res.json({ 
      data: { _id: result.insertedId, ...message },
      message: 'Contact message sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Feedback API
app.get('/api/feedback', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const feedback = await db!.collection('user_feedback').find({}).sort({ created_at: -1 }).toArray();

    // Get all feedback replies
    const feedbackIds = feedback.map((f: any) => f._id.toString());
    const replies = await db!.collection('feedback_replies').find({
      feedback_id: { $in: feedbackIds }
    }).sort({ created_at: 1 }).toArray();

    // Group replies by feedback_id
    const repliesByFeedback = replies.reduce((acc: any, reply: any) => {
      const feedbackId = reply.feedback_id.toString();
      if (!acc[feedbackId]) acc[feedbackId] = [];
      acc[feedbackId].push(serializeDoc(reply));
      return acc;
    }, {});

    // Attach replies to feedback
    const feedbackWithReplies = feedback.map((f: any) => ({
      ...serializeDoc(f),
      replies: repliesByFeedback[f._id.toString()] || []
    }));

    res.json({
      data: feedbackWithReplies,
      total: feedback.length,
      message: 'Feedback fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { feedback_text, rating, category, user_id } = req.body;

    if (!feedback_text) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }

    const result = await db!.collection('user_feedback').insertOne({
      user_id: user_id || null,
      feedback_text,
      rating: rating || null,
      category: category || 'General',
      status: 'pending',
      admin_response: null,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({
      data: {
        _id: result.insertedId,
        feedback_text,
        rating,
        category,
        status: 'pending'
      },
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Add feedback reply endpoint
app.post('/api/feedback/:feedbackId/replies', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { feedbackId } = req.params;
    const { reply_text } = req.body;
    const adminId = req.user?.userId;

    if (!reply_text) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    let query: any;
    try {
      query = { _id: new ObjectId(feedbackId) };
    } catch {
      query = { _id: feedbackId };
    }

    // Check if feedback exists
    const feedback = await db!.collection('user_feedback').findOne(query);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Add reply
    const replyResult = await db!.collection('feedback_replies').insertOne({
      feedback_id: feedbackId,
      reply_text,
      replied_by: adminId,
      replied_by_role: 'admin',
      created_at: new Date()
    });

    // Update feedback status to 'responded'
    await db!.collection('user_feedback').updateOne(query, {
      $set: {
        status: 'responded',
        updated_at: new Date()
      }
    });

    res.json({
      data: {
        _id: replyResult.insertedId,
        feedback_id: feedbackId,
        reply_text,
        replied_by: adminId,
        replied_by_role: 'admin',
        created_at: new Date()
      },
      message: 'Reply added successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get feedback by user ID (for user dashboard)
app.get('/api/feedback/user/:userId', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { userId } = req.params;

    // Ensure user can only access their own feedback
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const feedback = await db!.collection('user_feedback').find({ user_id: userId }).sort({ created_at: -1 }).toArray();

    // Get replies for this user's feedback
    const feedbackIds = feedback.map((f: any) => f._id.toString());
    const replies = await db!.collection('feedback_replies').find({
      feedback_id: { $in: feedbackIds }
    }).sort({ created_at: 1 }).toArray();

    // Group replies by feedback_id
    const repliesByFeedback = replies.reduce((acc: any, reply: any) => {
      const feedbackId = reply.feedback_id.toString();
      if (!acc[feedbackId]) acc[feedbackId] = [];
      acc[feedbackId].push(serializeDoc(reply));
      return acc;
    }, {});

    // Attach replies to feedback
    const feedbackWithReplies = feedback.map((f: any) => ({
      ...serializeDoc(f),
      replies: repliesByFeedback[f._id.toString()] || []
    }));

    res.json({
      data: feedbackWithReplies,
      total: feedback.length,
      message: 'User feedback fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Analytics API (admin only) - Optimized with caching
app.get('/api/analytics/dashboard', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    const cacheKey = 'analytics:dashboard';

    // Try cache first
    let cachedAnalytics = await cacheService.get(cacheKey);
    if (cachedAnalytics) {
      return res.set({
        'X-Cache': 'HIT',
        'Cache-Control': 'private, max-age=300'
      }).json(cachedAnalytics);
    }

    // Get analytics from optimized database service
    const analytics = await databaseService.getDashboardAnalytics();

    const result = {
      data: {
        totalProducts: analytics.products.totalProducts || 0,
        activeOrders: (analytics.orders.pending || 0) + (analytics.orders.processing || 0) + (analytics.orders.Pending || 0) + (analytics.orders.Confirmed || 0),
        totalOrders: Object.values(analytics.orders).reduce((sum: number, count: any) => sum + count, 0),
        totalCustomers: analytics.users.totalUsers || 0,
        newsletterSubscribers: await databaseService.getDb().collection('newsletter_subscribers').countDocuments(),
        lowStockProducts: analytics.lowStockProducts.map(serializeDoc),
        recentOrders: analytics.recentOrders.map(serializeDoc),
        totalRevenue: analytics.revenue.totalRevenue || 0
      },
      message: 'Analytics fetched successfully'
    };

    // Cache the result
    await cacheService.set(cacheKey, result, (cacheService.constructor as any).ttls.analytics);

    res.set({
      'X-Cache': 'MISS',
      'Cache-Control': 'private, max-age=300'
    }).json(result);

  } catch (error) {
    logger.error('Analytics fetch error', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Newsletter API
app.get('/api/newsletter', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const subscribers = await db!.collection('newsletter_subscribers').find({}).sort({ subscribedAt: -1 }).toArray();
    res.json({ data: subscribers.map(serializeDoc), total: subscribers.length, message: 'Subscribers fetched successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/newsletter', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    // Check if already subscribed
    const existing = await db!.collection('newsletter_subscribers').findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already subscribed' });
    
    const result = await db!.collection('newsletter_subscribers').insertOne({
      email,
      name: name || '',
      subscribedAt: new Date(),
      created_at: new Date()
    });
    
    res.json({ data: { _id: result.insertedId, email, name }, message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Farm Visits API - Optimized
app.get('/api/farm-visits', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { page = '1', limit = '10', status, search } = req.query as {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
    };

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await db!.collection('farm_visits').countDocuments(filter);

    // Get paginated results
    const visits = await db!.collection('farm_visits')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.json({
      data: visits.map(serializeDoc),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      message: 'Farm visits fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/farm-visits', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { name, email, phone, preferredDate, notes } = req.body;

    // Enhanced validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid name is required (minimum 2 characters)' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
      return res.status(400).json({ error: 'Valid phone number is required (minimum 10 digits)' });
    }

    if (!preferredDate) {
      return res.status(400).json({ error: 'Preferred date is required' });
    }

    const preferredDateObj = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preferredDateObj < today) {
      return res.status(400).json({ error: 'Preferred date cannot be in the past' });
    }

    // Check for duplicate bookings on the same date for the same email
    const existingVisit = await db!.collection('farm_visits').findOne({
      email: email.toLowerCase().trim(),
      preferredDate: preferredDateObj,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingVisit) {
      return res.status(400).json({
        error: 'You already have a visit scheduled for this date. Please choose a different date or contact us.'
      });
    }

    // Generate unique visit ID
    const visitId = `VISIT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const visitData = {
      visitId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      preferredDate: preferredDateObj,
      status: 'Pending',
      notes: notes?.trim() || '',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db!.collection('farm_visits').insertOne(visitData);

    res.status(201).json({
      data: {
        _id: result.insertedId,
        visitId,
        name: visitData.name,
        email: visitData.email,
        status: 'Pending'
      },
      message: 'Visit request submitted successfully. We will contact you within 24 hours to confirm.'
    });
  } catch (error) {
    console.error('Farm visit creation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create visit request' });
  }
});

app.patch('/api/farm-visits/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updates: any = { updated_at: new Date() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const result = await db!.collection('farm_visits').findOneAndUpdate(
      query,
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({
      data: serializeDoc(result.value),
      message: 'Visit updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Categories API
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const categories = await db!.collection('categories').find({}).toArray();
    res.json({ data: categories.map(serializeDoc), message: 'Categories fetched successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/categories', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const category = req.body;
    const result = await db!.collection('categories').insertOne({
      ...category,
      created_at: new Date(),
      updated_at: new Date()
    });
    res.json({
      data: { id: result.insertedId.toString(), ...category },
      message: 'Category created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Chat Conversations API
app.get('/api/chat/conversations', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const conversations = await db!.collection('chat_conversations')
      .find({ user_id: userId })
      .sort({ updated_at: -1 })
      .limit(10)
      .toArray();
    
    res.json({ 
      data: conversations.map(serializeDoc),
      message: 'Conversations fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/chat/conversations/:conversationId', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const { conversationId } = req.params;
    const userId = req.user?.userId;
    
    let query: any;
    try {
      query = { _id: new ObjectId(conversationId), user_id: userId };
    } catch {
      query = { _id: conversationId, user_id: userId };
    }
    
    const conversation = await db!.collection('chat_conversations').findOne(query);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    
    res.json({ 
      data: serializeDoc(conversation),
      message: 'Conversation fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/chat/conversations', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { title = 'New Conversation' } = req.body;
    
    const result = await db!.collection('chat_conversations').insertOne({
      user_id: userId,
      title,
      messages: [],
      token_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.json({ 
      data: { 
        id: result.insertedId.toString(),
        title,
        messages: [],
        token_count: 0
      },
      message: 'Conversation created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/chat/conversations/:conversationId/messages', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const { conversationId } = req.params;
    const { message, role = 'user' } = req.body;
    const userId = req.user?.userId;
    
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    let query: any;
    try {
      query = { _id: new ObjectId(conversationId), user_id: userId };
    } catch {
      query = { _id: conversationId, user_id: userId };
    }
    
    const conversation = await db!.collection('chat_conversations').findOne(query);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    
    const newMessage = {
      id: Date.now().toString(),
      role,
      content: message,
      timestamp: new Date()
    };
    
    // Calculate approximate token count (rough estimate: 4 chars per token)
    const messageTokens = Math.ceil(message.length / 4);
    const newTokenCount = (conversation.token_count || 0) + messageTokens;
    
    // Keep conversation under token limit (approximately 4000 tokens for context)
    let updatedMessages = [...(conversation.messages || []), newMessage];
    if (newTokenCount > 4000) {
      // Remove oldest messages to stay under limit
      let currentTokens = newTokenCount;
      while (currentTokens > 3500 && updatedMessages.length > 1) {
        const removedMessage = updatedMessages.shift();
        if (removedMessage) {
          currentTokens -= Math.ceil(removedMessage.content.length / 4);
        }
      }
    }
    
    await db!.collection('chat_conversations').updateOne(query, {
      $set: {
        messages: updatedMessages,
        token_count: Math.min(newTokenCount, 4000),
        updated_at: new Date()
      }
    });
    
    res.json({ 
      data: newMessage,
      message: 'Message added successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.delete('/api/chat/conversations/:conversationId', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const { conversationId } = req.params;
    const userId = req.user?.userId;
    
    let query: any;
    try {
      query = { _id: new ObjectId(conversationId), user_id: userId };
    } catch {
      query = { _id: conversationId, user_id: userId };
    }
    
    const result = await db!.collection('chat_conversations').deleteOne(query);
    if (!result.deletedCount) return res.status(404).json({ error: 'Conversation not found' });
    
    res.json({ 
      data: { id: conversationId },
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Chat API with Gemini integration
app.post('/api/chat/message', verifyToken, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const { message, conversationId } = req.body;
    const userId = req.user?.userId;
    
    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    // Get product information for context
    const products = await db!.collection('products').find({}).limit(20).toArray();
    const productContext = products.map((p: any) => ({
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      stock: p.stock,
      unit: p.unit
    }));
    
    // Get or create conversation
    let conversation;
    if (conversationId) {
      let query: any;
      try {
        query = { _id: new ObjectId(conversationId), user_id: userId };
      } catch {
        query = { _id: conversationId, user_id: userId };
      }
      conversation = await db!.collection('chat_conversations').findOne(query);
    }
    
    if (!conversation) {
      // Create new conversation
      const result = await db!.collection('chat_conversations').insertOne({
        user_id: userId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
        token_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      conversation = {
        _id: result.insertedId,
        user_id: userId,
        messages: [],
        token_count: 0
      };
    }
    
    // Prepare conversation history for Gemini
    const conversationHistory = (conversation.messages || []).slice(-10); // Last 10 messages
    const geminiMessages = conversationHistory.map((msg: { role: string; content: string; timestamp: Date }) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role, // Gemini uses 'model' instead of 'assistant'
      parts: [{ text: msg.content }]
    }));
    
    // Enhanced system prompt with advanced agentic capabilities
    const systemPrompt = `You are the Edau Farm Assistant — an advanced AI agent representing Edau Farm with sophisticated multi-agent capabilities.

CORE MISSION:
Help customers discover, purchase, and engage with Edau Farm's sustainable products and experiences through intelligent, context-aware assistance.

AGENT SPECIALIZATIONS:

1. 🛒 PRODUCT EXPERT
   - Detailed product information, comparisons, and recommendations
   - Stock availability and pricing
   - Nutritional benefits and usage suggestions
   - Seasonal availability and harvesting information

2. 📦 ORDER ASSISTANT
   - Guide users through order placement
   - Handle bulk/wholesale inquiries
   - Calculate totals and suggest quantities
   - Process payment and delivery options

3. 🏡 VISIT COORDINATOR
   - Schedule farm tours and family visits
   - Provide availability and booking information
   - Explain visit packages and pricing
   - Handle group bookings and special requests

4. 🤝 WHOLESALE MANAGER
   - Business-to-business ordering
   - Volume discounts and pricing tiers
   - Delivery logistics and scheduling
   - Account management for regular clients

5. 💬 CUSTOMER SUPPORT
   - Handle complaints and feedback
   - Provide account assistance
   - Answer FAQs and general inquiries
   - Newsletter subscriptions and updates

INTELLIGENT FEATURES:

🎯 INTENT DETECTION:
- Automatically classify user queries and route to appropriate agent
- Detect follow-up questions and maintain context
- Identify buying signals and guide toward conversion
- Recognize urgent requests and escalate appropriately

🧠 CONTEXT AWARENESS:
- Remember user preferences and past interactions
- Provide personalized recommendations
- Track conversation flow and offer relevant follow-ups
- Maintain professional yet friendly tone

⚡ PROACTIVE ASSISTANCE:
- Suggest complementary products
- Offer timing-sensitive recommendations (seasonal items)
- Provide order status updates when relevant
- Share farm news and updates

CURRENT PRODUCT INVENTORY:
${productContext.map((p: any) => `- ${p.name} (${p.category}): ${p.description} - KSh ${p.price}/${p.unit}, ${p.stock} available`).join('\n')}

RESPONSE GUIDELINES:

1. **Always reference real inventory data** - Never make up products or prices
2. **Be specific and actionable** - Include exact prices, quantities, and next steps
3. **Guide toward conversion** - Naturally suggest products, visits, or orders
4. **Maintain context** - Reference previous parts of conversation
5. **Offer alternatives** - If item unavailable, suggest similar products
6. **Be transparent** - Clearly indicate when switching between agent roles

CONVERSATION FLOW:
- Start with greeting and offer help
- Ask clarifying questions when needed
- Provide options and recommendations
- Guide through decision-making process
- End with clear next steps or call-to-action

CONTACT INFORMATION:
📞 Phone: 0727690165 (for urgent matters)
📧 Email: info@edaufarm.com
🏠 Address: Edau Farm, Sustainable Agriculture Center

Remember: You are the friendly face of Edau Farm. Be helpful, knowledgeable, and enthusiastic about sustainable farming!`;

    // Add system prompt and user message
    const fullMessages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...geminiMessages,
      { role: 'user', parts: [{ text: message }] }
    ];
    
    // Call Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI service temporarily unavailable' });
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: fullMessages,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          }
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Gemini API error response:', await response.text());
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";
    console.log('Extracted AI response:', aiResponse);
    
    // Save user message to conversation
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    // Save AI response to conversation
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    // Calculate tokens
    const userTokens = Math.ceil(message.length / 4);
    const aiTokens = Math.ceil(aiResponse.length / 4);
    const newTokenCount = (conversation.token_count || 0) + userTokens + aiTokens;
    
    // Update conversation with new messages
    let updatedMessages = [...(conversation.messages || []), userMessage, aiMessage];
    
    // Manage token limit
    if (newTokenCount > 4000) {
      let currentTokens = newTokenCount;
      while (currentTokens > 3500 && updatedMessages.length > 2) {
        const removedMessage = updatedMessages.shift();
        if (removedMessage) {
          currentTokens -= Math.ceil(removedMessage.content.length / 4);
        }
      }
    }
    
    await db!.collection('chat_conversations').updateOne(
      { _id: conversation._id },
      {
        $set: {
          messages: updatedMessages,
          token_count: Math.min(newTokenCount, 4000),
          updated_at: new Date()
        }
      }
    );
    
    res.json({
      data: {
        response: aiResponse,
        conversationId: conversation._id.toString(),
        tokenCount: Math.min(newTokenCount, 4000)
      },
      message: 'Message processed successfully'
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Chat service temporarily unavailable',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Gallery API
// Upload image to Cloudinary and save metadata to MongoDB
app.post('/api/gallery', verifyToken, adminOnly, upload.single('image'), async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const result = await cloudinary.uploader.upload_stream({
      folder: 'edau_gallery',
      resource_type: 'image',
    }, async (error: any, result: any) => {
      if (error) return res.status(500).json({ error: error.message });
      const galleryDoc = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: req.file.originalname,
        uploaded_by: req.user?.id,
        created_at: new Date(),
      };
      await db!.collection('gallery').insertOne(galleryDoc);
      res.json({ data: galleryDoc, message: 'Image uploaded successfully' });
    });
    result.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// List gallery images
app.get('/api/gallery', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const images = await db!.collection('gallery').find({}).sort({ created_at: -1 }).toArray();
    res.json({ data: images.map(serializeDoc), message: 'Gallery images fetched' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete gallery image (from Cloudinary and DB)
app.delete('/api/gallery/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const imageDoc = await db!.collection('gallery').findOne(query);
    if (!imageDoc) return res.status(404).json({ error: 'Image not found' });
    await cloudinary.uploader.destroy(imageDoc.public_id);
    await db!.collection('gallery').deleteOne(query);
    res.json({ data: { id }, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to database first
    db = await databaseService.connect();

    // Connect to Redis cache
    await cacheService.connect();

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info('🚀 Backend server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        database: 'connected',
        cache: 'connected',
        timestamp: new Date().toISOString()
      });

      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
      console.log(`📈 Performance metrics: http://localhost:${PORT}/api/metrics`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 MongoDB connected with optimized connection pooling`);
      console.log(`⚡ Redis cache enabled for improved performance`);
      console.log(`🎯 Frontend-Backend concurrent setup active`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await databaseService.disconnect();
          await cacheService.disconnect();
          logger.info('Database and cache connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();