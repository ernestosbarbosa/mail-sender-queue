# mail-sender-queue

Este projeto tem como objetivo realizar o envio de emails em lote via serviço de Exchange

## Dependências
- NodeJS
- IDE da sua preferência (utilizei o VSCode)

## Instalação
Para instalar as dependências você pode utilizar o comando `npm install`

## Execução
Para executar a aplicação você pode utilizar os comandos `npm start` ou `node server.js`

## Acesso à aplicação
A aplicação inicializa na porta 8090, sendo acessível via `http://localhost:8090`

## Execução via Docker

Você também pode subir a aplicação via docker seguindo os comandos abaixo:

- `docker build -t msq .`
- `docker run -d --name msq -p 8090:8090 msq`