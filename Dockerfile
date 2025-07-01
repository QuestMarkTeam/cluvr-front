# 1. Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .

RUN npm run build

# 2. Production Stage
FROM nginx:alpine

# Copy the build files from the build stage to the nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the necessary port
EXPOSE 80
