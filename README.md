# Contest App

A modern contest/polling application built with React, Express, and PostgreSQL. This application allows users to participate in contests by making predictions and viewing real-time leaderboards.

## 🚀 Features

- **Contest Management**: Create and manage contests with multiple questions
- **Real-time Polling**: Participants can make selections on contest questions
- **Leaderboard**: Live ranking system based on correct predictions
- **Admin CMS**: Content management system for contest administration
- **WebSocket Support**: Real-time updates for enhanced user experience
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI
- **Authentication**: Session-based authentication
- **Deployment**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js 20+ 
- Docker and Docker Compose
- PostgreSQL database (or use provided Docker setup)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contest-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other configurations
   ```

4. **Start development environment**
   ```bash
   # Using the provided script
   chmod +x scripts/dev.sh
   ./scripts/dev.sh

   # Or manually
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

### Production Deployment

1. **Prepare environment**
   ```bash
   # Create production environment file
   cp .env.example .env
   # Update .env with production values
   ```

2. **Deploy using script**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

3. **Or deploy manually**
   ```bash
   # Build and start production containers
   docker build -t contest-app:latest .
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🐳 Docker Commands

### Development
```bash
# Start development environment
npm run docker:dev

# Stop all containers
npm run docker:stop

# View logs
docker-compose logs -f
```

### Production
```bash
# Build production image
npm run docker:build

# Start production environment
npm run docker:prod

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🗄️ Database Setup

### Using Docker (Recommended for development)
The Docker Compose setup includes a PostgreSQL container that's automatically configured.

### Using External Database (Production)
1. Set up a PostgreSQL database (Neon, AWS RDS, etc.)
2. Update `DATABASE_URL` in your `.env` file
3. Run migrations:
   ```bash
   npm run db:push
   ```

### Database Commands
```bash
# Push schema changes
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

## 🔧 Environment Variables

### Required Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key
```

### Optional Variables
```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
WS_HEARTBEAT_INTERVAL=30000
```

## 📁 Project Structure

```
contest-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Database operations
├── shared/                 # Shared schemas and types
├── scripts/               # Deployment scripts
├── Dockerfile             # Production container
├── docker-compose.yml     # Development setup
├── docker-compose.prod.yml # Production setup
└── package.json
```

## 🔐 Security Features

- **Helmet.js**: Security headers in production
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin request management
- **Input Validation**: Zod schema validation
- **Non-root Docker User**: Container security
- **Session Security**: Secure session management

## 📊 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/contest` - Get active contest
- `GET /api/contest/:id/questions` - Get contest questions
- `POST /api/contest/:id/join` - Join contest
- `GET /api/contest/:id/leaderboard` - Get leaderboard

### Admin Endpoints (Authentication Required)
- `POST /api/cms/login` - Admin login
- `GET /api/cms/contests` - Manage contests
- `POST /api/cms/contests` - Create contest
- `GET /api/cms/questions` - Manage questions

## 🎯 Performance Optimizations

- **Docker Multi-stage Build**: Optimized production images
- **Compression**: Gzip compression in production
- **Static Asset Caching**: Efficient asset delivery
- **Database Connection Pooling**: Neon serverless with connection pooling
- **Rate Limiting**: Prevent API abuse

## 📈 Monitoring & Health Checks

- **Health Check Endpoint**: `/api/health`
- **Docker Health Checks**: Container health monitoring
- **Graceful Shutdown**: Proper process termination
- **Error Handling**: Comprehensive error management

## 🔄 CI/CD Recommendations

1. **GitHub Actions Example**:
   ```yaml
   - name: Build Docker Image
     run: docker build -t contest-app:${{ github.sha }} .
   
   - name: Run Tests
     run: npm test
   
   - name: Deploy to Production
     run: ./scripts/deploy.sh
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   ```

2. **Database connection issues**
   - Verify DATABASE_URL format
   - Check database server status
   - Ensure database exists

3. **Docker build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   ```

4. **Application won't start**
   ```bash
   # Check logs
   docker-compose logs app
   ```

### Getting Help

- Check the application logs: `docker-compose logs -f`
- Verify environment variables are set correctly
- Ensure all required services are running
- Check the health endpoint: `curl http://localhost:5000/api/health`

## 🔗 Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/) 