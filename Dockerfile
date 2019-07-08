FROM node:latest

COPY ./ /app

WORKDIR /app

RUN npm i

CMD ["node", "index.js"]

EXPOSE 8888