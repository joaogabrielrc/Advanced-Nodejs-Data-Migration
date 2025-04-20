import http from "node:http";
import { Readable, Transform } from "node:stream";

http
  .createServer(handler)
  .listen(3000)
  .on("listening", () => console.log("Server is listening on port 3000"));

function handler(_, response) {
  const startTime = Date.now();

  const size = 3e5; // three hundred thousand records
  const readableStream = Readable.from(generateChunks(size));

  const logStream = new Transform({
    transform(chunk, encoding, callback) {
      console.log(`Chunk size: ${chunk.length} bytes`);
      callback(null, chunk);
    },
  });

  readableStream.pipe(logStream).pipe(response);

  readableStream.on("end", () => {
    response.end();
  });

  readableStream.on("error", (error) => {
    console.error("Error reading data:", error);
    response.statusCode = 500;
    response.end("Internal Server Error");
  });

  response.on("close", () => {
    readableStream.destroy();

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`File sent in ${duration}ms`);
  });
}

async function* generateChunks(size) {
  for await (const data of run(size)) {
    yield Buffer.from(JSON.stringify(data));
  }
}

function* run(size) {
  for (let count = 0; count < size; count++) {
    yield {
      id: count,
      name: `name-${count}`,
    };
  }
}
