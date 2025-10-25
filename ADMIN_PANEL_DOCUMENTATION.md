# Edau Farm - Admin Panel Documentation

## 🎉 Overview

The Edau Farm Admin Panel is now **fully functional** with a comprehensive farm management system following the complete schema provided. This documentation outlines all implemented features, database schema, API endpoints, and design specifications.

---

## 🧭 Admin Panel Sections

### ✅ Implemented Sections

| Section | Route | Status | Description |
|---------|-------|--------|-------------|
| **Dashboard Overview** | `/admin` | ✅ Complete | Analytics, quick stats, low stock alerts, recent orders |
| **Products Management** | `/admin/products` | ✅ Complete | Full CRUD with categories, units, tags, filters, search |
| **Orders Management** | `/admin/orders` | ✅ Complete | View, update status, delete orders |
| **Users Management** | `/admin/users` | ✅ Complete | View, edit, delete users |
| **Farm Visits** | `/admin/farm-visits` | ✅ Complete | Manage tour requests, update status |
| **Newsletter** | `/admin/newsletter` | ✅ Complete | View subscribers, export to CSV |
| **Feedback & Messages** | `/admin/feedback` | ⚠️ Existing | View feedback (can be enhanced with inquiry types) |
| **Analytics** | `/admin/analytics` | ⚠️ Existing | Sales analytics (can be enhanced) |
| **Gallery** | `/admin/gallery` | ⚠️ Existing | Image management (can be enhanced) |

---

## 🗄️ Database Schema

### Products Collection
```typescript
{
  _id: ObjectId,
  name: string,
  category: "Honey" | "Dorper Sheep" | "Fruits" | "Poultry",
  description: string,
  price: number,
  unit: string, // "kg", "liter", "unit", "crate", "jar", "box"
  stock: number,
  imageURL: string[], // Multiple images
  image_url: string, // Backward compatibility
  sku: string,
  availability: boolean,
  is_active: boolean,
  tags: string[], // ["organic", "pure", "premium"]
  created_at: Date,
  updated_at: Date
}
```

### Orders Collection
```typescript
{
  _id: ObjectId,
  orderId: string, // Unique order reference
  user_id: string,
  customerName: string,
  email: string,
  phone: string,
  productId: string,
  quantity: number,
  total_amount: number,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "Pending" | "Confirmed" | "Shipped" | "Delivered",
  orderType: "Product" | "Bulk" | "Visit",
  payment_method: string,
  payment_reference: string,
  shipping_address: string,
  notes: string,
  dateOrdered: Date,
  deliveryDate: Date,
  created_at: Date,
  updated_at: Date
}
```

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,
  password: string, // bcrypt hashed
  first_name: string,
  last_name: string,
  phone: string,
  address: string,
  role: "admin" | "moderator" | "user",
  created_at: Date,
  updated_at: Date
}
```

### Farm Visits Collection
```typescript
{
  _id: ObjectId,
  visitId: string, // "VISIT-{timestamp}"
  name: string,
  email: string,
  phone: string,
  preferredDate: Date,
  status: "Pending" | "Confirmed" | "Completed",
  notes: string,
  created_at: Date,
  updated_at: Date
}
```

### Newsletter Subscribers Collection
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  subscribedAt: Date,
  created_at: Date
}
```

### Contact Messages / Inquiries Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  inquiry_type: string,
  type: "Product Orders" | "Farm Visits" | "Bulk Orders" | "General",
  message: string,
  status: string,
  created_at: Date,
  updated_at: Date
}
```

---

## 🔌 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders` - List all orders (filter by userId)
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order (admin only)

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Farm Visits
- `GET /api/farm-visits` - List all visit requests (admin only)
- `POST /api/farm-visits` - Submit visit request
- `PATCH /api/farm-visits/:id` - Update visit status (admin only)

### Newsletter
- `GET /api/newsletter` - List subscribers (admin only)
- `POST /api/newsletter` - Subscribe to newsletter

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard stats (admin only)
  - Returns: totalProducts, activeOrders, totalOrders, totalCustomers, newsletterSubscribers, lowStockProducts, recentOrders, totalRevenue

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Other
- `GET /api/contact` - List contact messages
- `POST /api/contact` - Submit contact message
- `GET /api/feedback` - List feedback
- `GET /api/health` - Health check

---

## 🎨 Design Theme

### Colors
- **Primary Green**: `#4CAF50` - Sustainability, nature
- **Accent Honey Yellow**: `#F4B400` - Warmth, farm produce
- **Neutral Background**: `#F9F9F9`
- **Text**: `#2F2F2F`

### Typography
- Font: Inter / Poppins
- Headers: Bold, 2xl to 3xl
- Body: Regular, sm to base

### Components Used
- **shadcn/ui**: Table, Dialog, Card, Badge, Button
- **Lucide Icons**: Package, ShoppingCart, Users, Mail, Calendar, AlertTriangle, etc.
- **Responsive Grid**: Mobile-first, breakpoints for md and lg

---

## 🚀 Features Implemented

### Dashboard Overview
- ✅ Total Products counter
- ✅ Active Orders counter
- ✅ Total Customers counter
- ✅ Newsletter Subscribers counter
- ✅ Total Revenue display
- ✅ Low Stock Alerts (products with stock < 10)
- ✅ Recent Orders list (last 5)
- ✅ Quick Action buttons

### Products Management
- ✅ Full CRUD (Create, Read, Update, Delete)
- ✅ Category filter (Honey, Dorper Sheep, Fruits, Poultry)
- ✅ Search by name or tags
- ✅ Multi-field form: name, category, unit, price, stock, description, SKU, image URL, tags, availability
- ✅ Tag management (add/remove tags)
- ✅ Availability toggle
- ✅ Stock quantity display with low stock warning
- ✅ Responsive table with badges and action buttons

### Orders Management
- ✅ View all orders in table
- ✅ Update order status (pending, processing, shipped, delivered, cancelled)
- ✅ Delete orders (admin only)
- ✅ Display customer info, total amount, status, created date
- ✅ Dialog for status updates
- ✅ Confirmation dialog for deletion

### Users Management
- ✅ View all registered users
- ✅ Edit user details (first name, last name, phone, address)
- ✅ Delete users (admin only)
- ✅ Display registration date
- ✅ Responsive table and edit forms

### Farm Visits Management
- ✅ View all visit requests
- ✅ Update visit status (Pending, Confirmed, Completed)
- ✅ Display visitor details, preferred date, notes
- ✅ Status badges with color coding

### Newsletter Management
- ✅ View all subscribers
- ✅ Display subscription stats (total, this month)
- ✅ Export subscribers to CSV
- ✅ Responsive subscriber table

---

## 🔐 Security

### Authentication & Authorization
- JWT tokens with 7-day expiration
- Password hashing with bcryptjs (10 salt rounds)
- Token stored in localStorage
- Middleware: `verifyToken` and `adminOnly`

### Protected Routes
- All admin routes require valid JWT
- Admin-only endpoints enforce role check
- Rate limiting: 200 requests per 15 minutes per IP

---

## 📦 Tech Stack

### Backend
- **Express.js** (TypeScript)
- **MongoDB** with native driver
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT
- **express-rate-limit** for rate limiting
- **CORS** enabled for frontend

### Frontend
- **React** 18 with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **React Query** (optional, can be added)
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **Lucide React** for icons

---

## 📊 Admin Sidebar Navigation

1. Dashboard - Analytics overview
2. Products - Full product management
3. Orders - Order tracking and status updates
4. Users - User management
5. Farm Visits - Tour request management
6. Newsletter - Subscriber management
7. Feedback & Messages - Customer inquiries
8. Analytics - Sales reports (existing)
9. Gallery - Image management (existing)

---

## 🛠️ Next Steps & Enhancements

### Recommended Additions
1. **Inquiries Management**: Categorize contact messages by type (Product Orders, Farm Visits, Bulk Orders, General)
2. **Bulk Orders Section**: Separate management for wholesale orders
3. **Reports & Export**: PDF/Excel export for monthly sales, customer growth
4. **Image Upload**: Implement actual file upload for product images (currently URL-based)
5. **Email Integration**: Send confirmation emails for orders, visits, newsletter
6. **Charts & Graphs**: Add visual analytics (Chart.js, Recharts)
7. **Product Reviews**: Allow customers to rate and review products
8. **Inventory Notifications**: Automated alerts for low stock via email/SMS

### Performance Optimizations
- Implement pagination for large datasets (products, orders, users)
- Add caching for analytics data (Redis)
- Optimize image loading with CDN
- Implement lazy loading for tables

---

## 📝 Usage Instructions

### Running the Application

1. **Start Backend**:
   ```bash
   cd server
   npm run dev
   ```
   Backend runs on `http://localhost:3001`

2. **Start Frontend**:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Admin Access

1. Create an admin user by registering and manually updating the `role` field in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@edaufarm.com" },
     { $set: { role: "admin" } }
   )
   ```

2. Login at `/login` with admin credentials
3. Access admin panel at `/admin`

---

## 🎯 Summary

The Edau Farm Admin Panel is now **production-ready** with:
- ✅ Complete CRUD operations for Products, Orders, Users
- ✅ Dashboard with real-time analytics
- ✅ Farm Visits management
- ✅ Newsletter subscriber management
- ✅ Secure JWT authentication and admin-only routes
- ✅ Modern, responsive UI following the #4CAF50 green theme
- ✅ Full backend API with MongoDB integration
- ✅ Type-safe TypeScript implementation

All features align with the comprehensive schema provided for a scalable farm management system! 🌿🐑🍯🐓
