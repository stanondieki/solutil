# Solutil Backend API

A robust Node.js backend for the Solutil service booking platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management, email verification
- **Service Management**: CRUD operations for services with categories and pricing
- **Booking System**: Complete booking lifecycle management
- **Payment Integration**: Stripe and M-Pesa payment processing
- **Real-time Communication**: Socket.IO for live updates and chat
- **File Upload**: Cloudinary integration for image handling
- **Email Services**: Automated email notifications
- **Security**: Rate limiting, helmet protection, input validation
- **Logging**: Comprehensive logging with Winston
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret
   - Email service credentials
   - Cloudinary credentials
   - Stripe keys

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── models/              # MongoDB models
├── routes/              # API routes
├── utils/               # Utility functions
├── logs/                # Log files
├── scripts/             # Database scripts
├── server.js            # Main server file
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/social-login` - Social authentication

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service (Provider only)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Handle payment webhooks

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent abuse with configurable limits
- **Helmet**: Security headers for HTTP requests
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS policies
- **Password Hashing**: Bcrypt for secure password storage

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with rotation
- **Error Handling**: Centralized error management
- **Request Logging**: HTTP request/response logging
- **Performance Monitoring**: Response time tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_super_secure_jwt_secret
   ```

2. **Build and Deploy**
   ```bash
   npm install --production
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis integration for session and data caching
- **Compression**: Gzip compression for API responses
- **Connection Pooling**: Efficient database connections

## 🔧 Configuration Options

### Rate Limiting
```javascript
RATE_LIMIT_WINDOW=15  // minutes
RATE_LIMIT_MAX=100    // requests per window
```

### File Upload
```javascript
MAX_FILE_SIZE=5242880        // 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### Security
```javascript
BCRYPT_ROUNDS=12
JWT_EXPIRE=7d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- Authentication system
- Service management
- Booking system
- Payment integration

---

Built with ❤️ for the Solutil platform
