const http = require('http');
const fs = require('fs');
const { Command } = require('commander');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const program = new Command();

program
  .requiredOption('-h, --host <string>', 'Адреса сервера')
  .requiredOption('-p, --port <number>', 'Порт сервера', parseInt)
  .requiredOption('-i, --input <path>', 'Шлях до XML-файлу з даними облігацій')
  .parse(process.argv);

const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const handleRequest = (req, res) => {
  fs.readFile(options.input, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading input file:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading input file');
      return;
    }

    const parser = new XMLParser();
    const jsonObj = parser.parse(data);

    const xmlData = jsonObj.auctions.auction.map((auction) => {
      return {
        StockCode: auction.StockCode,
        ValCode: auction.ValCode,
        Attraction: auction.Attraction,
      };
    });

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
    });

    const newXml = builder.build({ data: { auction: xmlData } });

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(newXml);
  });
};

const server = http.createServer(handleRequest);

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
