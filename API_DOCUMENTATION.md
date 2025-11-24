# 📡 API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+90 555 123 4567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@playable.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@playable.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "addresses": []
  }
}
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+90 555 999 8888"
}
```

---

## 📦 Category Endpoints

### Get All Categories
```http
GET /api/categories
```

**Query Parameters:**
- `isActive` (optional): Filter by active status (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "641234567890abcdef123456",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Latest electronic devices",
      "image": "https://example.com/electronics.jpg",
      "isActive": true
    }
  ]
}
```

### Get Category by ID
```http
GET /api/categories/{id}
```

### Create Category (Admin only)
```http
POST /api/categories
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "image": "https://example.com/image.jpg"
}
```

### Update Category (Admin only)
```http
PUT /api/categories/{id}
Authorization: Bearer {token}
```

### Delete Category (Admin only)
```http
DELETE /api/categories/{id}
Authorization: Bearer {token}
```

---

## 🛍️ Product Endpoints

### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 12): Items per page
- `category`: Filter by category ID
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `minRating`: Minimum rating filter
- `search`: Search in name/description
- `sort`: Sort field (default: -createdAt)
  - `-createdAt`: Newest first
  - `price`: Price low to high
  - `-price`: Price high to low
  - `-averageRating`: Top rated
  - `-totalOrders`: Most popular

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "641234567890abcdef123456",
      "name": "Product Name",
      "slug": "product-name",
      "description": "Product description",
      "price": 299.99,
      "compareAtPrice": 399.99,
      "category": {
        "_id": "641234567890abcdef123456",
        "name": "Electronics"
      },
      "images": ["url1", "url2"],
      "stock": 50,
      "averageRating": 4.5,
      "totalReviews": 120
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 60,
    "totalPages": 5
  }
}
```

### Get Featured Products
```http
GET /api/products/featured
```

**Query Parameters:**
- `type`: featured/most-ordered/top-rated/newest
- `limit` (default: 8): Number of products

### Get Product by ID
```http
GET /api/products/{id}
```

### Create Product (Admin only)
```http
POST /api/products
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 299.99,
  "compareAtPrice": 399.99,
  "category": "641234567890abcdef123456",
  "images": ["url1", "url2"],
  "stock": 100,
  "sku": "PROD-001",
  "specifications": [
    { "key": "Brand", "value": "Samsung" },
    { "key": "Color", "value": "Black" }
  ],
  "isFeatured": false
}
```

### Update Product (Admin only)
```http
PUT /api/products/{id}
Authorization: Bearer {token}
```

### Bulk Update Products (Admin only)
```http
PUT /api/products/bulk-update
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "productIds": ["id1", "id2", "id3"],
  "isActive": false
}
```

### Delete Product (Admin only)
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

### Add Product Review
```http
POST /api/products/{id}/reviews
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

### Get Product Statistics (Admin only)
```http
GET /api/products/admin/stats
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProducts": 60,
    "activeProducts": 55,
    "outOfStock": 3,
    "lowStock": 5
  }
}
```

---

## 🛒 Order Endpoints

### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "items": [
    {
      "product": "641234567890abcdef123456",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Istanbul",
    "state": "Istanbul",
    "zipCode": "34000",
    "country": "Turkey"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver after 5 PM"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "641234567890abcdef123456",
    "orderNumber": "ORD-1234-ABCD",
    "user": "507f1f77bcf86cd799439011",
    "items": [...],
    "subtotal": 599.98,
    "tax": 107.99,
    "shippingCost": 50,
    "total": 757.97,
    "orderStatus": "pending",
    "paymentStatus": "paid"
  }
}
```

### Get User Orders
```http
GET /api/orders/my-orders
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status`: Filter by order status

### Get Order by ID
```http
GET /api/orders/{id}
Authorization: Bearer {token}
```

### Cancel Order
```http
PUT /api/orders/{id}/cancel
Authorization: Bearer {token}
```

### Get All Orders (Admin only)
```http
GET /api/orders/admin/all
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`, `limit`, `status`, `search`

### Update Order Status (Admin only)
```http
PUT /api/orders/{id}/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

### Get Order Statistics (Admin only)
```http
GET /api/orders/admin/stats
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "pendingOrders": 25,
    "processingOrders": 40,
    "deliveredOrders": 80,
    "cancelledOrders": 5,
    "totalSales": 125000.50,
    "recentOrders": [...],
    "salesTrend": [...]
  }
}
```

---

## 👥 Customer Endpoints (Admin only)

### Get All Customers
```http
GET /api/customers
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`, `limit`, `search`

### Get Customer Details
```http
GET /api/customers/{id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "orders": [...],
    "statistics": {
      "totalOrders": 5,
      "totalSpent": 2500.00
    }
  }
}
```

### Get Customer Statistics
```http
GET /api/customers/stats
Authorization: Bearer {token}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "errors": ["Email is required", "Password must be at least 6 characters"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized, no token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server error"
}
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Pagination starts at page 1
- Default limit is 10-12 items per page
- Rate limit: 100 requests per 15 minutes
- JWT tokens expire after 7 days
- Tax rate: 18%
- Free shipping on orders over 500 TRY