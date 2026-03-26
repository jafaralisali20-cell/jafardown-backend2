FROM node:18-bullseye

# Install python and ffmpeg (required for yt-dlp)
RUN apt-get update && \
    apt-get install -y python3 ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD [ "npm", "start" ]
