import client from "./db-client.js";
import { getSalesDataSync } from "./generate-sales-data.js";

async function seed() {
  await client.connect();

  const startTime = Date.now();

  const numRecords = 1_000_000;
  const sales = getSalesDataSync(numRecords);

  for (const sale of sales) {
    try {
      console.log(`Inserting record: ${sale.produto}`);
      await storeData(sale);
    } catch (err) {
      console.error("Error inserting sale:", err);
      break;
    }
  }

  console.log(
    `Total of ${sales.length} records inserted in ${Date.now() - startTime}ms`
  );

  await client.end();
}

// Call the function to insert data
seed().catch((err) => console.error("Error inserting data:", err));

async function storeData(sale) {
  const query = `
    INSERT INTO vendas (produto, quantidade, preco_unitario, total, data_venda)
    VALUES ($1, $2, $3, $4, $5)
  `;

  const values = [
    sale.produto,
    sale.quantidade,
    sale.preco_unitario,
    sale.total,
    sale.data_venda,
  ];

  await client
    .query(query, values)
    .catch((err) => console.error("Error executing query:", err));
}
