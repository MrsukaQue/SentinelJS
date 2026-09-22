FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY client/package.json client/package.json
RUN npm install --workspace client
COPY client client
RUN npm -w client run build

FROM nginx:1.29-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
