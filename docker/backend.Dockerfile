FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
COPY demo/package.json demo/package.json
RUN npm ci --workspace server
COPY server server
RUN npm -w server run db:generate
USER node
CMD ["npm", "-w", "server", "start"]
