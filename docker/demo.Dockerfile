FROM node:22-alpine
WORKDIR /app
COPY demo/package.json ./
RUN npm install --omit=dev
COPY demo/src src
USER node
CMD ["node", "src/index.js"]
