FROM node:alpine

WORKDIR /home/mail-sender

COPY . .

RUN npm install

EXPOSE 8090

ENTRYPOINT [ "npm", "start" ]