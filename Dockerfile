# Multi-stage build for optimal Next.js production deployment
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables using ARG (will be passed from docker-compose)
ARG BASE_URL
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GOOGLE_API_KEY
ARG GROQ_API_KEY
ARG POLAR_ACCESS_TOKEN
ARG POLAR_WEBHOOK_SECRET
ARG NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ARG NODE_ENV

# Set as environment variables for the build process
ENV BASE_URL=$BASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV GOOGLE_API_KEY=$GOOGLE_API_KEY
ENV GROQ_API_KEY=$GROQ_API_KEY
ENV POLAR_ACCESS_TOKEN=$POLAR_ACCESS_TOKEN
ENV POLAR_WEBHOOK_SECRET=$POLAR_WEBHOOK_SECRET
ENV NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID=$NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NODE_ENV=$NODE_ENV

# Generate theme registry and build the application
RUN npm run generate-theme-registry && \
    npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./

# Copy database migration scripts and schema
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./

# Copy theme registry and generated files
COPY --from=builder --chown=nextjs:nodejs /app/public/r ./public/r
COPY --from=builder --chown=nextjs:nodejs /app/scripts/generate-*.ts ./scripts/

# Copy package.json and all node_modules to ensure drizzle-kit works
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Set user to non-root
USER nextjs

# Expose the listening port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Run database migrations and then start the application
CMD ["/bin/sh", "-c", "npx drizzle-kit push && node server.js"]
