import { pipeline, Transform } from "node:stream";
import express from "express";
import pg from "pg";
import QueryStream from "pg-query-stream";

const app = express();

const dbConfig = {
  user: "user",
  host: "localhost",
  database: "vendas_db",
  password: "password",
  port: 5432,
};

app.get("/export", handle);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

async function handle(_, response) {
  const startTime = Date.now();

  const client = new pg.Client(dbConfig);
  await client.connect();

  const sql = `SELECT id, produto, quantidade, preco_unitario, total, data_venda FROM vendas`;
  const queryStream = new QueryStream(sql, [], { highWaterMark: 1_000 });
  const stream = client.query(queryStream);

  console.log("Exportando dados com pg-query-stream...");

  pipeline(
    stream,
    new Transform({
      objectMode: true,
      transform(row, _, callback) {
        const formattedRow = formatRow(row);
        callback(null, Buffer.from(formattedRow + "\n"));
      },
    }),
    response,
    async (err) => {
      await client.end();
      if (err) {
        console.error("Erro no pipeline:", err);
        response.status(500).end("Erro no fluxo de dados.");
      } else {
        console.log("Exportação concluída.");
      }
    }
  );

  stream.on("error", (err) => {
    console.error("Erro no fluxo do PostgreSQL:", err);
    response.status(500).end("Erro no fluxo do PostgreSQL.");
  });

  response.on("close", async () => {
    console.log("Conexão fechada pelo cliente.");
    await client.end();
    console.log(`Tempo total de execução: ${formatExecutionTime(startTime)}`);
  });
}

const formatExecutionTime = (startTime) => {
  const elapsedTime = Date.now() - startTime;
  const milliseconds = elapsedTime % 1000;
  const seconds = Math.floor((elapsedTime / 1000) % 60);
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  const hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);

  return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
};

const formatRow = (row) => {
  return JSON.stringify({
    id: row.id,
    produto: row.produto,
    quantidade: row.quantidade,
    precoUnitario: row.preco_unitario,
    total: row.total,
    dataVenda: row.data_venda,
  });
};

// Exemplo de execução:
// curl -X GET -o output.file http://localhost:3001/export

//
// Meu resultado com 2 milhões de linhas:
//
// Server is running on port 3001
// Exportando dados com pg-query-stream...
// Conexão fechada pelo cliente.
// Tempo total de execução: 0h 0m 11s 619ms
// Exportação concluída.
