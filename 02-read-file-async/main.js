// Command to generate a large (1GB) file for testing
// node -e "process.stdout.write(crypto.randomBytes(1e9))" > big.file

import http from "node:http";
import fs from "node:fs";

http
  .createServer(handler)
  .listen(3000)
  .on("listening", () => console.log("Server is listening on port 3000"));

function handler(_, response) {
  const startTime = Date.now();
  const readableStream = fs.createReadStream("./big.file");

  readableStream.on("data", (chunk) => {
    console.log(`Chunk size: ${chunk.length} bytes`);
    response.write(chunk.toString("base64"));
  });

  readableStream.on("end", () => {
    response.end();
  });

  readableStream.on("error", (error) => {
    console.error("Error reading file:", error);
    response.statusCode = 500;
    response.end("Internal Server Error");
  });

  response.on("close", () => {
    readableStream.destroy();

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`File sent in ${duration}ms`);
    console.log(`File size: ${readableStream.bytesRead} bytes`);
  });
}

// To test the server, run in terminal:
// curl -o output.file http://localhost:3000
