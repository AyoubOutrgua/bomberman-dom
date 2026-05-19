import http from 'http';
import fs from 'node:fs/promises';
import path from "path"
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url)
const direname = path.dirname(filename)

const server = http.createServer(async(req, res) => {
    if (req.url === "/") {
        res.setHeader('content-type','text/html')
    try {
        const filePath = path.join(direname,"../index.html")
        const data = await fs.readFile(filePath,'utf8')
        res.statusCode = 200; 
        console.log("hello bomberman");
        res.end(data); 
    } catch (error) {
        res.statusCode = 500;
        res.end("internal server Eror");
    }
}else {
    res.setHeader('content-type', 'text/plain')
    res.statusCode = 404
    res.end("page not found")
}
});

const port = 3000;

server.listen(port, () => {
    console.log("server run on 3000");
});