import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import cloudinary from './cloudinary';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://chapinin777:CzvFbEsIpBeKaGDx@cluster0.hxakj.mongodb.net/edauDB';
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';

let db: Db | null = null;

const connectToDatabase = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('edauDB');

    // Create indexes for better performance
    await db.collection('farm_visits').createIndexes([
      { key: { created_at: -1 } },
      { key: { preferredDate: 1 } },
      { key: { status: 1 } },
      { key: { email: 1, preferredDate: 1 } },
      { key: { name: 'text', email: 'text', phone: 'text' } }
    ]);

    await db.collection('products').createIndexes([
      { key: { category: 1 } },
      { key: { created_at: -1 } },
      { key: { name: 'text', description: 'text' } }
    ]);

    await db.collection('chat_conversations').createIndexes([
      { key: { user_id: 1, updated_at: -1 } },
      { key: { created_at: -1 } },
      { key: { token_count: 1 } }
    ]);

    await db.collection('feedback_replies').createIndexes([
      { key: { feedback_id: 1, created_at: 1 } },
      { key: { replied_by: 1 } }
    ]);

    console.log('✅ Connected to MongoDB with optimized indexes');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://edau.loopnet.tech', 'https://www.edau.loopnet.tech'] 
    : ['http://localhost:5173', 'http://172.17.88.218', 'http://localhost:5174', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json());

// Rate limiting for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', apiLimiter);

// Helper to serialize MongoDB documents (convert _id to id)
const serializeDoc = (doc: any) => {
  if (!doc) return doc;
  const { _id, password, ...rest } = doc;
  return { id: _id?.toString?.() || _id, ...rest };
};

const upload = multer({ storage: multer.memoryStorage() });

// Basic routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running with MongoDB',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Products API
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const products = await db!.collection('products').find({}).toArray();
    const data = products.map(serializeDoc);
    res.json({ 
      data,
      total: products.length,
      message: 'Products fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const product = req.body;
    const result = await db!.collection('products').insertOne({
      ...product,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.json({ 
      data: { id: result.insertedId.toString(), ...product },
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update product
app.patch('/api/products/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
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
    const result = await db!.collection('products').findOneAndUpdate(query, { $set: updates }, { returnDocument: 'after' });
    if (!result || !result.value) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: serializeDoc(result.value), message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete product
app.delete('/api/products/:id', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const result = await db!.collection('products').deleteOne(query);
    if (!result.deletedCount) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: { id }, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get single product by id
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      // If not a valid ObjectId, also try by string id field
      query = { _id: id };
    }
    const product = await db!.collection('products').findOne(query);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ data: serializeDoc(product), message: 'Product fetched successfully' });
  } catch (error) {
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
    const { first_name, last_name, phone, address, role } = req.body;
    const updates: any = { first_name, last_name, phone, address, updated_at: new Date() };
    if (role) updates.role = role;
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
    const feedbackIds = feedback.map(f => f._id.toString());
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
    const feedbackWithReplies = feedback.map(f => ({
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
    const feedbackIds = feedback.map(f => f._id.toString());
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
    const feedbackWithReplies = feedback.map(f => ({
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

// Analytics API (admin only)
app.get('/api/analytics/dashboard', verifyToken, adminOnly, async (req: AuthedRequest, res: Response) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    // Get counts
    const totalProducts = await db!.collection('products').countDocuments();
    const activeOrders = await db!.collection('orders').countDocuments({ 
      status: { $in: ['pending', 'processing', 'Pending', 'Confirmed'] } 
    });
    const totalOrders = await db!.collection('orders').countDocuments();
    const totalCustomers = await db!.collection('users').countDocuments();
    const newsletterSubscribers = await db!.collection('newsletter_subscribers').countDocuments();
    
    // Get low stock products (stock < 10)
    const lowStockProducts = await db!.collection('products')
      .find({ stock: { $lt: 10 } })
      .project({ name: 1, stock: 1, category: 1 })
      .toArray();
    
    // Get recent orders (last 5)
    const recentOrders = await db!.collection('orders')
      .find({})
      .sort({ created_at: -1 })
      .limit(5)
      .toArray();
    
    // Calculate total revenue
    const revenueResult = await db!.collection('orders').aggregate([
      { $match: { status: { $in: ['delivered', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]).toArray();
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    res.json({
      data: {
        totalProducts,
        activeOrders,
        totalOrders,
        totalCustomers,
        newsletterSubscribers,
        lowStockProducts: lowStockProducts.map(serializeDoc),
        recentOrders: recentOrders.map(serializeDoc),
        totalRevenue
      },
      message: 'Analytics fetched successfully'
    });
  } catch (error) {
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
    const productContext = products.map(p => ({
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
${productContext.map(p => `- ${p.name} (${p.category}): ${p.description} - KSh ${p.price}/${p.unit}, ${p.stock} available`).join('\n')}

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
    path: req.originalUrl
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 MongoDB connected to edauDB`);
      console.log(`🎯 Frontend-Backend concurrent setup active`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();