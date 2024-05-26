    # Use the official Node.js image as a base
    FROM node:latest

    # Set the working directory inside the container
    WORKDIR /app

    COPY index.js .

    COPY frontend/ ./frontend/
    

    # Copy the backend code into the container
    COPY backend/ ./backend/

    # Set working directory for backend code
    WORKDIR /app/backend

    # Install backend dependencies
    RUN npm install

    WORKDIR /app/frontend

    # Install backend dependencies
    RUN npm install

    # Go back to the root directory
    WORKDIR /app

    # Expose ports
    EXPOSE 3000
    EXPOSE 4000 
    EXPOSE 8080

    # Command to run your application
    CMD ["node","index.js"]
