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
  const file = fs.readFileSync("./big.file"); // Reading the file synchronously

  // Error: Cannot create a string longer than 0x1fffffe8 characters
  response.write(file.toString("utf-8"));

  // Command to pass the file as a buffer
  // response.write(file);

  response.end();

  response.on("close", () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`File sent in ${duration}ms`);
    console.log(`File size: ${file.length} bytes`);
  });
}

// To test the server, run in terminal:
// curl -o output.file http://localhost:3000
