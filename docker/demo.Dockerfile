FROM node:22-alpine
WORKDIR /app
COPY demo/package.json ./
COPY demo/src src
USER node
CMD ["node", "src/index.js"]
