# 1. Choose a base Node.js image (Choose an LTS version)
FROM node:22.14-alpine AS base
# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# 4. Install production dependencies
# Using npm ci is generally faster and more reliable for CI/CD if you have a package-lock.json
# RUN npm ci --only=production
# Or use npm install if you prefer/don't have a lock file
RUN npm install --only=production --ignore-scripts --prefer-offline

# 5. Copy the rest of your application code
COPY . .

# 6. Expose the port the app runs on (from your .env file)
EXPOSE 5000

# 7. Define the command to run your app
CMD [ "node", "app.js" ]

# Optional: For better security, run as a non-root user
