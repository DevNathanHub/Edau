import { MongoClient, Db, ObjectId, ReadPreference } from 'mongodb';
import { logger } from './logger.js';

class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  async connect(): Promise<Db> {
    if (this.db && this.isConnected) {
      return this.db;
    }

    try {
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://chapinin777:CzvFbEsIpBeKaGDx@cluster0.hxakj.mongodb.net/edauDB';

      // Optimized MongoDB client configuration
      this.client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10, // Maximum connection pool size
        minPoolSize: 2,  // Minimum connection pool size
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        readPreference: ReadPreference.SECONDARY_PREFERRED, // Prefer secondary reads for better performance
        retryWrites: true,
        retryReads: true,
      });

      await this.client.connect();
      this.db = this.client.db('edauDB');
      this.isConnected = true;

      logger.info('✅ Connected to MongoDB with optimized connection pooling');

      // Create optimized indexes
      await this.createIndexes();

      return this.db;
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // Products collection indexes
      await this.db.collection('products').createIndexes([
        { key: { category: 1 } },
        { key: { created_at: -1 } },
        { key: { name: 'text', description: 'text' } },
        { key: { stock: 1 } },
        { key: { price: 1 } },
        { key: { category: 1, stock: 1 } },
        { key: { category: 1, price: 1 } }
      ]);

      // Orders collection indexes
      await this.db.collection('orders').createIndexes([
        { key: { user_id: 1, created_at: -1 } },
        { key: { status: 1, created_at: -1 } },
        { key: { created_at: -1 } },
        { key: { total_amount: -1 } }
      ]);

      // Users collection indexes
      await this.db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { role: 1 } },
        { key: { created_at: -1 } }
      ]);

      // Farm visits collection indexes
      await this.db.collection('farm_visits').createIndexes([
        { key: { created_at: -1 } },
        { key: { preferredDate: 1 } },
        { key: { status: 1 } },
        { key: { email: 1, preferredDate: 1 } },
        { key: { name: 'text', email: 'text', phone: 'text' } }
      ]);

      // Chat conversations indexes
      await this.db.collection('chat_conversations').createIndexes([
        { key: { user_id: 1, updated_at: -1 } },
        { key: { created_at: -1 } },
        { key: { token_count: 1 } }
      ]);

      // Feedback collection indexes
      await this.db.collection('user_feedback').createIndexes([
        { key: { user_id: 1, created_at: -1 } },
        { key: { status: 1, created_at: -1 } },
        { key: { created_at: -1 } }
      ]);

      // Gallery collection indexes
      await this.db.collection('gallery').createIndexes([
        { key: { created_at: -1 } },
        { key: { uploaded_by: 1 } }
      ]);

      logger.info('✅ Database indexes created/verified');
    } catch (error) {
      logger.error('❌ Failed to create indexes:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      logger.info('✅ Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  // Optimized query methods
  async getProducts(filter: any = {}, options: any = {}): Promise<any[]> {
    const db = this.getDb();
    const query = this.buildProductQuery(filter);

    return await db.collection('products')
      .find(query, options)
      .sort({ created_at: -1 })
      .toArray();
  }

  async getProductById(id: string): Promise<any | null> {
    const db = this.getDb();
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    return await db.collection('products').findOne(query);
  }

  async getProductsCount(filter: any = {}): Promise<number> {
    const db = this.getDb();
    const query = this.buildProductQuery(filter);
    return await db.collection('products').countDocuments(query);
  }

  private buildProductQuery(filter: any): any {
    const query: any = {};

    if (filter.category && filter.category !== 'all') {
      query.category = filter.category;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
    }

    if (filter.inStock !== undefined) {
      query.stock = filter.inStock ? { $gt: 0 } : { $lte: 0 };
    }

    return query;
  }

  // Analytics aggregation pipeline
  async getDashboardAnalytics(): Promise<any> {
    const db = this.getDb();

    const [productStats, orderStats, userStats, revenueStats, lowStockProducts, recentOrders] = await Promise.all([
      // Product statistics
      db.collection('products').aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$price' },
            lowStockCount: {
              $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] }
            }
          }
        }
      ]).toArray(),

      // Order statistics
      db.collection('orders').aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),

      // User statistics
      db.collection('users').aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            adminCount: {
              $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
            }
          }
        }
      ]).toArray(),

      // Revenue statistics
      db.collection('orders').aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'Delivered'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total_amount' },
            orderCount: { $sum: 1 }
          }
        }
      ]).toArray(),

      // Low stock products
      db.collection('products')
        .find({ stock: { $lt: 10 } })
        .project({ name: 1, stock: 1, category: 1 })
        .sort({ stock: 1 })
        .limit(10)
        .toArray(),

      // Recent orders
      db.collection('orders')
        .find({})
        .sort({ created_at: -1 })
        .limit(5)
        .toArray()
    ]);

    return {
      products: productStats[0] || {},
      orders: orderStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      users: userStats[0] || {},
      revenue: revenueStats[0] || {},
      lowStockProducts,
      recentOrders
    };
  }

  // Health check
  async healthCheck(): Promise<any> {
    const db = this.getDb();

    try {
      // Test database connectivity
      await db.admin().ping();

      // Get basic stats
      const stats = await db.stats();

      return {
        status: 'healthy',
        database: {
          name: stats.db,
          collections: stats.collections,
          indexes: stats.indexes,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const databaseService = new DatabaseService();