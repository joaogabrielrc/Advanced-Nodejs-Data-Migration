import { Readable } from "stream";
import { from as copyFrom } from "pg-copy-streams";

import client from "./db-client.js";
import { generateSalesData } from "./generate-sales-data.js";

async function seed() {
  await client.connect();

  const startTime = Date.now();

  const numRecords = 1_000_000;
  const generator = generateSalesData(numRecords);
  let processedRecords = 0;

  // Create a readable stream from the generator
  const readableStream = Readable.from(
    (async function* () {
      for (const record of generator) {
        processedRecords++;
        displayProgressBar(processedRecords, numRecords);
        yield record.join("\t") + "\n";
      }
    })()
  );

  const copyQuery = `
    COPY vendas (produto, quantidade, preco_unitario, total, data_venda)
    FROM STDIN WITH (FORMAT text)
  `;

  const stream = client.query(copyFrom(copyQuery));
  readableStream.pipe(stream);

  readableStream.on("error", (err) => {
    console.error("Error in readable stream:", err);
    client.end();
  });

  stream.on("finish", () => {
    console.log(
      `\nTotal of ${numRecords} records inserted in ${Date.now() - startTime}ms`
    );
    client.end();
  });

  stream.on("error", (err) => {
    console.error("Error during COPY operation:", err);
    client.end();
  });
}

function displayProgressBar(processed, total) {
  const barLength = 40; // Length of the progress bar
  const progress = Math.min(processed / total, 1);
  const filledLength = Math.round(barLength * progress);
  const bar = "=".repeat(filledLength) + "-".repeat(barLength - filledLength);
  process.stdout.write(`\r[${bar}] ${Math.round(progress * 100)}%`);
}

seed().catch((err) => console.error("Error inserting data:", err));
