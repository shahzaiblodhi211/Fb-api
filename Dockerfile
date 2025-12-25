# Use Node.js 20
FROM node:20

# Set working directory to project root inside container
WORKDIR /var/www/advertiserassets

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean npm cache and install dependencies
RUN npm install

# Copy all project files including .env
COPY . .

# Build Next.js project
RUN npm run build

# Expose port 3001
EXPOSE 3001

# Start Next.js server on 0.0.0.0:3001
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3001"]

