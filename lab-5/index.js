const http = require('http');
const { Command } = require('commander');
const fs = require('fs');

const program = new Command();

program
  .version('1.0.0')
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <cache>', 'Path to cache directory')
  .parse(process.argv);

console.log('Parsed arguments:', program.opts());

const { host, port, cache } = program.opts();

console.log(`Received arguments: Host - ${host}, Port - ${port}, Cache directory - ${cache}`);

if (!host || !port || !cache) {
  console.error('Error: Missing required arguments');
  process.exit(1);
}

if (!fs.existsSync(cache)) {
  console.error(`Error: Cache directory does not exist: ${cache}`);
  console.log('Attempting to create the directory...');
  
  fs.mkdirSync(cache, { recursive: true });
  console.log(`Directory "${cache}" has been created.`);
}

console.log(`Cache directory "${cache}" exists, proceeding to create the server...`);

const server = http.createServer((req, res) => {
  console.log('Received request:', req.method, req.url); 
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running\n');
});

console.log(`Starting server at ${host}:${port}...`);

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});