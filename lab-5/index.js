const { Command } = require("commander");
const http = require("node:http");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require("path");

const program = new Command();

program
    .requiredOption("-h, --host <host>", "Specify the host")
    .requiredOption("-p, --port <port>", "Specify the port")
    .requiredOption("-c, --cache <path>", "Path for cached files");

program.parse(program.argv);

const options = program.opts();

const cachePath = path.resolve(options.cache);
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
    console.log(`Directory created: ${cachePath}`);
} else {
    console.log(`Directory already exists: ${cachePath}`);
}

async function readFromFile(filename) {
    const filepath = path.join(cachePath, filename);
    try {
        const data = await fsPromises.readFile(filepath);
        return data;
    } catch (error) {
        console.error("Error reading file:", error);
        return null;
    }
}

async function writeToFile(filename, data) {
    const filepath = path.join(cachePath, filename);
    try {
        await fsPromises.writeFile(filepath, data);
        console.log(`File written: ${filepath}`);
    } catch (error) {
        console.error("Error writing file:", error);
    }
}

const server = http.createServer(async (req, res) => {
    const statusCode = req.url.slice(1); 
    const filename = `${statusCode}.jpg`;
    const filePath = path.join(cachePath, filename);

    if (statusCode === '') {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Welcome to the server");
        console.log(`[${req.method}] / → 200 OK (Welcome message)`);
        return;
    }

    switch (req.method) {
        case "GET":
            if (fs.existsSync(filePath)) {
                const image = await readFromFile(filename);
                res.writeHead(200, { "Content-Type": "image/jpeg" });
                res.end(image);
                console.log(`[GET] /${statusCode} → 200 OK (Image sent)`);
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
                console.log(`[GET] /${statusCode} → 404 Not Found`);
            }
            return;

        case "PUT":
            let body = [];
            req.on('data', chunk => {
                body.push(chunk);
            });

            req.on('end', async () => {
                if (body.length > 0) {
                    const imageBuffer = Buffer.concat(body);
                    await writeToFile(filename, imageBuffer);
                    res.writeHead(201, { "Content-Type": "text/plain" });
                    res.end("Created and saved the image");
                    console.log(`[PUT] /${statusCode} → 201 Created (Image saved)`);
                } else {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    res.end("No image data provided");
                    console.log(`[PUT] /${statusCode} → 400 Bad Request (No data)`);
                }
            });
            return;

        case "DELETE":
            if (fs.existsSync(filePath)) {
                await fsPromises.unlink(filePath);
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("File deleted successfully");
                console.log(`[DELETE] /${statusCode} → 200 OK (File deleted)`);
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
                console.log(`[DELETE] /${statusCode} → 404 Not Found`);
            }
            return;

        default:
            res.writeHead(405, { "Content-Type": "text/plain" });
            res.end("Method Not Allowed");
            console.log(`[${req.method}] /${statusCode} → 405 Method Not Allowed`);
            return;
    }
});


server.listen(options.port, options.host, () => {
    console.log(`Server is running at http://${options.host}:${options.port}`);
});
