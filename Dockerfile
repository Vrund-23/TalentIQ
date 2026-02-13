# 1. Use the official Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:latest

# 2. Switch to ROOT user to avoid permission errors
USER root

# 3. Set the working directory
WORKDIR /usr/src/app

# 4. Copy package files
COPY package*.json ./

# 5. Install dependencies
RUN npm install

# 6. Copy the rest of your application code
COPY . .

# --- MAGIC FIX SECTION: TRICK NEXT.JS BUILD ---
# Next.js checks for these keys during build.
# We give them fake values so it doesn't crash.
ENV MONGODB_URI="mongodb://mock_url_for_build_only"

# ImageKit Mock Keys
ENV IMAGEKIT_PUBLIC_KEY="mock_public_key"
ENV IMAGEKIT_PRIVATE_KEY="mock_private_key"
ENV IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/mock_id"

# Redis Mock Keys (To stop the warnings)
ENV UPSTASH_REDIS_REST_URL="https://mock-redis.upstash.io"
ENV UPSTASH_REDIS_REST_TOKEN="mock_token"
# ----------------------------------------------

# 7. Build the Next.js application
RUN npm run build

# 8. Switch back to the non-root user for security
USER pptruser

# 9. Expose the port
EXPOSE 3000

# 10. Start the app
CMD ["npm", "start"]