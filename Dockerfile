# 1. Use the official Puppeteer image (Includes Chrome + Node.js)
FROM ghcr.io/puppeteer/puppeteer:latest

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package files first (for better caching)
COPY package*.json ./

# 4. Install dependencies
# We use 'npm ci' for a clean, reliable install
RUN npm ci

# 5. Copy the rest of your application code
COPY . .

# --- MAGIC FIX: TRICK NEXT.JS BUILD ---
# Next.js tries to connect to the DB during build.
# We give it a fake URL so it doesn't crash.
ENV MONGODB_URI="mongodb://mock_url_for_build_only"
# --------------------------------------

# 6. Build the Next.js application
# This creates the .next folder
RUN npm run build

# 7. Switch to the non-root user (Required for Puppeteer security)
USER pptruser

# 8. Expose the port your app runs on
EXPOSE 3000

# 9. Start the app
# IF you have a custom server.js, keep this:
CMD ["node", "server.js"]

# IF you usually run "npm start", change the line above to:
# CMD ["npm", "start"]