FROM node:22-alpine

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY . .

RUN npm install

CMD ["npm", "start"]