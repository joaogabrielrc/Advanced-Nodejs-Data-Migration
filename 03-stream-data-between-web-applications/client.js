import http from "http";
import { createWriteStream } from "fs";
import { Transform } from "stream";

const url = "http://localhost:3000";
const outputFile = "output.file";

http.get(url, handler).on("error", (err) => {
  console.error(`Request error: ${err.message}`);
});

function handler(response) {
  if (response.statusCode !== 200) {
    console.error(`Failed to fetch data. Status code: ${response.statusCode}`);
    response.resume(); // Consume response data to free up memory
    return;
  }

  // Pipe the response through the transform stream to convert to string
  response.pipe(transformToString).pipe(logStream).pipe(fileStream);

  fileStream.on("finish", () => {
    console.log(`File saved as ${outputFile}`);
  });

  fileStream.on("error", (err) => {
    console.error(`Error writing to file: ${err.message}`);
  });
}

const transformToString = new Transform({
  transform(chunk, encoding, callback) {
    try {
      const string = chunk.toString().concat("\n");
      callback(null, string);
    } catch (error) {
      console.error(`Error parsing JSON: ${error.message}`);
      callback(error);
    }
  },
});

const logStream = new Transform({
  transform(chunk, encoding, callback) {
    process.stdout.write(`Data chunk: ${chunk}`);
    callback(null, chunk);
  },
});

const fileStream = createWriteStream(outputFile);
