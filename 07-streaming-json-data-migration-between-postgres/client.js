import http from "http";
import pg from "pg";
import { Transform } from "stream";

const url = "http://localhost:3000/export";

http.get(url, handler).on("error", (err) => {
  console.error(`Request error: ${err.message}`);
});

async function handler(response) {
  if (response.statusCode !== 200) {
    console.error(`Failed to fetch data. Status code: ${response.statusCode}`);
    response.resume(); // Consume response data to free up memory
    return;
  }

  const client = new pg.Client({
    user: "user",
    host: "localhost",
    database: "vendas_db",
    password: "password",
    port: 5432,
  });

  await client.connect();
  console.log("Conectado ao banco de dados.");
  console.log("Iniciando a migração de dados...");

  const batchSize = 1_000; // Batch size for processing
  let buffer = "";
  let batch = [];

  const transformStream = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      let boundary = buffer.indexOf("\n");

      while (boundary !== -1) {
        const line = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 1);

        if (line) {
          try {
            const parsedData = JSON.parse(line);
            batch.push(parsedData);

            if (batch.length === batchSize) {
              this.push(batch); // Push the batch to the next stream
              batch = [];
            }
          } catch (err) {
            console.error("Error parsing or preparing record:", err);
          }
        }

        boundary = buffer.indexOf("\n");
      }

      callback();
    },
    final(callback) {
      if (batch.length > 0) {
        this.push(batch);
      }
      callback();
    },
  });

  const writableStream = new Transform({
    objectMode: true,
    async transform(batch, encoding, callback) {
      try {
        await storeData(client, batch);
        callback();
      } catch (err) {
        console.error("Error inserting batch:", err);
        callback(err);
      }
    },
  });

  response
    .pipe(transformStream)
    .pipe(writableStream)
    .on("finish", async () => {
      console.log("Migração de dados concluída.");
      await client.end();
    })
    .on("error", (err) => {
      console.error("Erro no pipeline:", err.message);
    });
}

async function storeData(client, batch) {
  const values = batch
    .map((d, index) => {
      const base = index * 5;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${
        base + 5
      })`;
    })
    .join(",");

  const flatValues = batch.flatMap((d) => [
    d.produto,
    d.quantidade,
    d.precoUnitario,
    d.total,
    d.dataVenda,
  ]);

  try {
    await client.query(
      `INSERT INTO vendas2 (produto, quantidade, preco_unitario, total, data_venda) VALUES ${values}`,
      flatValues
    );
  } catch (err) {
    console.error("Error inserting batch:", err);
  }
}
