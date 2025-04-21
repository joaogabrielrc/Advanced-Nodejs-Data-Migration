import express from "express";
import pg from "pg";
import Cursor from "pg-cursor";

const app = express();

const dbConfig = {
  user: "user",
  host: "localhost",
  database: "vendas_db",
  password: "password",
  port: 5432,
};

const pool = new pg.Pool(dbConfig);

app.get("/export", handle);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

async function handle(_, response) {
  const startTime = Date.now();

  const client = await pool.connect();
  try {
    const sql = `SELECT id, produto, quantidade, preco_unitario, total, data_venda FROM vendas`;
    const cursor = client.query(new Cursor(sql));

    console.log("Exportando dados com pg-cursor...");

    const fetchRows = async () => {
      cursor.read(1_000, async (err, rows) => {
        if (err) {
          console.error("Erro no fluxo do PostgreSQL:", err);
          response.status(500).send("Erro no fluxo do PostgreSQL.");
          await closeResources(cursor, client);
          return;
        }

        if (rows.length === 0) {
          console.log("Exportação concluída.");
          response.end();
          await closeResources(cursor, client);
          return;
        }

        for (const row of rows) {
          const formattedRow = formatRow(row);
          response.write(Buffer.from(formattedRow) + "\n");
        }

        fetchRows();
      });
    };

    fetchRows();

    response.on("close", async () => {
      console.log("Conexão fechada pelo cliente.");
      await closeResources(cursor, client);
      console.log(`Tempo total de execução: ${formatExecutionTime(startTime)}`);
    });
  } catch (err) {
    console.error("Erro ao exportar dados:", err);
    response.status(500).send("Erro ao exportar dados.");
  }
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

const closeResources = async (cursor, client) => {
  try {
    if (!cursor.closed) {
      await cursor.close();
    }
    if (!client.released) {
      client.release();
      client.released = true;
    }
  } catch (err) {
    console.error("Erro ao fechar recursos:", err);
  }
};

// Exemplo de execução:
// curl -X GET -o output.file http://localhost:3000/export

//
// Meu resultado com 2 milhões de linhas:
//
// Server is running on port 3000
// Exportando dados com pg-cursor...
// Exportação concluída.
// Conexão fechada pelo cliente.
// Tempo total de execução: 0h 0m 9s 117ms
