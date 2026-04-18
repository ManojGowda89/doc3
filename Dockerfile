FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

COPY mjs ./mjs
COPY app ./app
# COPY public ./public   <-- comment or remove this line if no public folder

RUN npm install
RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=builder /app /app
COPY server ./server
COPY .env ./.env
ENV NODE_ENV=production

EXPOSE 9000

CMD ["npm", "start"]
