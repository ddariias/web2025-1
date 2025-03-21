const http = require('http');
const fs = require('fs');
const { Command } = require('commander');
const { XMLBuilder } = require('fast-xml-parser');

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

const handleRequest = (req, res) => {
  fs.readFile(options.input, 'utf-8', (err, jsonData) => {
    if (err) {
      console.error('Error reading input file:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading input file');
      return;
    }

    let jsonObj = JSON.parse(jsonData);

    jsonObj.forEach((item) => {
      if (!item.hasOwnProperty('r030')) item.r030 = '';
      if (!item.hasOwnProperty('txt')) item.txt = '';
      if (!item.hasOwnProperty('rate')) item.rate = 0;
      if (!item.hasOwnProperty('cc')) item.cc = '';
      if (!item.hasOwnProperty('exchangedate')) item.exchangedate = '';
    });

    const builder = new XMLBuilder({
      ignoreAttributes: false, 
      format: true, 
    });

    const xmlContent = builder.build({ currencies: { currency: jsonObj } });

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xmlContent);
  });
};

const server = http.createServer(handleRequest);

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
