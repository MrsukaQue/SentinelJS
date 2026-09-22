FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
COPY demo/package.json demo/package.json
RUN npm ci --workspace client
COPY client client
RUN npm -w client run build

FROM nginx:1.29-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
