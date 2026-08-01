FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install node-cron

COPY index.js ./

CMD ["node", "index.js"]
