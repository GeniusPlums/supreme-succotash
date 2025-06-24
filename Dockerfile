FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat dumb-init

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install ALL dependencies (simplest approach)
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start app
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"] 