# 1. Use the official Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:latest

# 2. Set the working directory
WORKDIR /usr/src/app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
# CHANGE: Use 'npm install' instead of 'npm ci' to fix lockfile errors
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# --- MAGIC FIX: TRICK NEXT.JS BUILD ---
# This allows the build to pass without a real DB connection
ENV MONGODB_URI="mongodb://mock_url_for_build_only"
# --------------------------------------

# 6. Build the Next.js application
RUN npm run build

# 7. Switch to the non-root user (Required for Puppeteer security)
USER pptruser

# 8. Expose the port
EXPOSE 3000

# 9. Start the app
CMD ["npm", "start"]