FROM node:18

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Wait for database to be ready, then run migrations and start the application
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npm run start:dev"]
