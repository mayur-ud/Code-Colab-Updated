    FROM node:latest

    WORKDIR /app


    COPY . ./backend

    WORKDIR /app/backend
    RUN npm install
    # Expose ports
    EXPOSE 4000

    # Command to run your application
    CMD ["node","index.js"]
