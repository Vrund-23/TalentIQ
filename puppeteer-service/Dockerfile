FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /usr/src/app

COPY package*.json ./
# Use --omit=dev to avoid installing devDependencies
RUN npm install --omit=dev

COPY . .

# Run as non-root user (pptruser is created by the base image)
USER pptruser

EXPOSE 4000
CMD [ "node", "index.js" ]
