FROM node:latest

# Set working directory
WORKDIR /app

# Copy frontend files
COPY . /app/frontend

# Move into frontend directory
WORKDIR /app/frontend

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 3000

# Command to run your application
CMD ["npm", "run", "dev"]
