FROM ghcr.io/puppeteer/puppeteer:23.10.1 

# Use root for package installation
USER root

# Allow apt commands to run without permissions error
RUN chmod -R a+rwx /var/lib/apt/lists /var/cache/apt/archives /var/log

# Install Google Chrome and dependencies
RUN apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends

# Revert back to Puppeteer user after installation for security
USER pptruser

# Set Puppeteer to use the installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["node", "index.js"]
