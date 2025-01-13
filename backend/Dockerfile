FROM ghcr.io/puppeteer/puppeteer:23.10.1 

RUN apt-get update && apt-get install -y google-chrome-stable


# Set the executable path for Puppeteer to used

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app
RUN which chromium || echo "Chromium not found"

COPY package.json package-lock.json ./
RUN npm ci 

COPY . .

CMD ["node", "index.js"]
