const express = require('express');
const { Command } = require('commander');
const fs = require('fs');
const http = require('http');
const path = require('path');

const program = new Command();

program
  .requiredOption('-H, --host <host>', 'Адреса сервера (host)')
  .requiredOption('-p, --port <port>', 'Порт сервера (port)', parseInt)
  .requiredOption('-c, --cache <path>', 'Шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.cache)) {
  console.error(`Директорія кешу не існує: ${options.cache}`);
  process.exit(1);
}

const app = express();

app.get('/', (req, res) => {
  res.send('Сервер працює через http.Server');
});

const server = http.createServer(app);

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
