import client from "./db-client.js";
import { getSalesDataSync } from "./generate-sales-data.js";

async function seed() {
  await client.connect();

  const startTime = Date.now();

  const batchSize = 1_000;
  let count = 0;

  // FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
  // const numRecords = 50_000_000;

  const numRecords = 1_000_000;
  const sales = getSalesDataSync(numRecords);

  let batch = [];
  for (const sale of sales) {
    batch.push(sale);

    if (batch.length === batchSize) {
      try {
        await storeData(batch);

        count += batch.length;
        console.log(`Inserted ${count} records...`);
        batch = [];
      } catch (err) {
        console.error("Error inserting batch:", err);
        break;
      }
    }
  }

  // Insert any remaining records
  if (batch.length > 0) {
    try {
      await storeData(batch);
      count += batch.length;
      console.log(`Inserted ${count} records...`);
    } catch (err) {
      console.error("Error inserting final batch:", err);
    }
  }

  console.log(
    `Total of ${numRecords} records inserted in ${Date.now() - startTime}ms`
  );

  await client.end();
}

// Call the function to insert data
seed().catch((err) => console.error("Error inserting data:", err));

async function storeData(batch) {
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
    d.preco_unitario,
    d.total,
    d.data_venda,
  ]);

  await client.query(
    `INSERT INTO vendas (produto, quantidade, preco_unitario, total, data_venda) VALUES ${values}`,
    flatValues
  );
}
