const http = require('http');
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

const program = new Command();

program
  .version('1.0.0')
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <cache>', 'Path to cache directory')
  .parse(process.argv);

const { host, port, cache } = program.opts();

console.log(`Server will run on: ${host}:${port}`);
console.log(`Cache directory is: ${cache}`);

if (!fs.existsSync(cache)) {
  console.error(`Error: Cache directory does not exist: ${cache}`);
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('/');
  const statusCode = urlParts[1];

  if (req.method === 'GET') {
    if (statusCode) {
      const imagePath = path.join(cache, `${statusCode}.jpg`);

      if (fs.existsSync(imagePath)) {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        fs.createReadStream(imagePath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
    }
  } else if (req.method === 'PUT') {
    if (statusCode) {
      const imagePath = path.join(cache, `${statusCode}.jpg`);

      const fileStream = fs.createWriteStream(imagePath);

      req.pipe(fileStream);

      req.on('end', () => {
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end('Created');
      });

      req.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error: ${err.message}`);
      });
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
