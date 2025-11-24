# 🛒 Playable E-commerce Platform

A modern, full-stack e-commerce platform built with **Next.js**, **Express.js**, and **MongoDB**. This application provides a complete shopping experience with customer features and admin management tools.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Express](https://img.shields.io/badge/Express-4.18-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green)

## 🌟 Features

### Customer Features
- ✅ **User Authentication**: Login, registration, and profile management
- ✅ **Homepage**: Category navigation and featured product sections (most ordered, top rated)
- ✅ **Product Browsing**: Filter by category, price range, and ratings with search functionality
- ✅ **Product Details**: Image gallery, specifications, reviews, and "Add to Cart"
- ✅ **Shopping Cart**: Item management, quantity updates, price calculations
- ✅ **Checkout**: Shipping address, payment simulation, order confirmation
- ✅ **Order History**: View past orders with status tracking

### Admin Features
- ✅ **Admin Dashboard**: Sales statistics, order counts, customer metrics
- ✅ **Product Management**: Add, edit, delete products with bulk actions
- ✅ **Stock Management**: Track and update product inventory
- ✅ **Order Management**: View and update order statuses
- ✅ **Customer Management**: View customer list and order history

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (or MongoDB Atlas account)
- **npm**: v9.0 or higher

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/playable-ecommerce.git
cd playable-ecommerce
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@playable.com
ADMIN_PASSWORD=Admin@123
```

Seed the database:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 👤 Demo Credentials

### Admin Account
- **Email**: `admin@playable.com`
- **Password**: `Admin@123`
- **Access**: Full admin dashboard and management features

### Customer Accounts
- **Email**: `john@example.com` | **Password**: `password123`
- **Email**: `jane@example.com` | **Password**: `password123`

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+90 555 123 4567"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@playable.com",
  "password": "Admin@123"
}
```

### Product Endpoints

#### Get All Products (with filters)
```http
GET /api/products?category={categoryId}&minPrice={min}&maxPrice={max}&sort=-createdAt&page=1&limit=12
```

#### Get Single Product
```http
GET /api/products/{productId}
```

#### Create Product (Admin only)
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 199.99,
  "category": "categoryId",
  "images": ["url1", "url2"],
  "stock": 50,
  "sku": "PROD-001"
}
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    { "product": "productId", "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Istanbul",
    "state": "Istanbul",
    "zipCode": "34000",
    "country": "Turkey"
  },
  "paymentMethod": "credit_card"
}
```

#### Get User Orders
```http
GET /api/orders/my-orders
Authorization: Bearer {token}
```

### Admin Endpoints

#### Get Order Statistics
```http
GET /api/orders/admin/stats
Authorization: Bearer {token}
```

#### Update Order Status
```http
PUT /api/orders/{orderId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderStatus": "shipped"
}
```

**Full API documentation available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

## 📁 Project Structure
```
playable-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Mongoose models
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Helper functions
│   │   ├── scripts/        # Database seeding
│   │   └── server.ts       # Express app entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/            # Next.js pages (App Router)
    │   ├── components/     # React components
    │   ├── lib/            # Utilities and API client
    │   ├── hooks/          # Custom React hooks
    │   ├── store/          # Zustand state management
    │   └── types/          # TypeScript types
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS protection
- Helmet.js for HTTP headers
- Input validation with express-validator
- Protected routes for admin access

## 🌐 Deployment

### Backend (Railway / Heroku)

1. Create a new project
2. Connect your GitHub repository
3. Set environment variables
4. Deploy from main branch

### Frontend (Vercel / Netlify)

1. Import project from GitHub
2. Framework: Next.js
3. Build command: `npm run build`
4. Set `NEXT_PUBLIC_API_URL` environment variable
5. Deploy

### Database (MongoDB Atlas)

1. Create a free cluster
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in backend

## 🧪 Testing

Access the application:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Admin Dashboard: `http://localhost:3000/admin` (login required)

## 📈 Features Implemented

- [x] User authentication and profile management
- [x] Product browsing with filters and search
- [x] Shopping cart and checkout
- [x] Order management
- [x] Admin dashboard with statistics
- [x] Product and category management
- [x] Customer management
- [x] Responsive design
- [x] Real-time notifications
- [x] Database seeding

## 🎯 Future Enhancements

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Advanced analytics
- [ ] Multi-language support

## 👨‍💻 Development
```bash
# Backend development
cd backend
npm run dev

# Frontend development
cd frontend
npm run dev
```

## 📄 License

This project is created as a case study for Playable Factory.

## 🤝 Contact

For any questions or feedback, please contact:
- Email: your-email@example.com
- GitHub: [@hakanduyar](https://github.com/hakanduyar)

---

**Built with ❤️ for Playable Factory Case Study**