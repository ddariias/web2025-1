const { Command } = require('commander');
const http = require('http');
const fs = require('fs');

const program = new Command();

program
  .requiredOption('-h, --host <string>', 'Адреса сервера')
  .requiredOption('-p, --port <number>', 'Порт сервера', parseInt)
  .requiredOption('-i, --input <path>', 'Шлях до JSON-файлу з даними НБУ')
  .parse(process.argv);

const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const jsonData = fs.readFileSync(options.input, 'utf-8');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(jsonData);
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
