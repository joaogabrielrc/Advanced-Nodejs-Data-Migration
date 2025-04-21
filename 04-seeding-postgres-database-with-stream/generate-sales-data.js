export function* generateSalesData(numRecords) {
  for (let i = 0; i < numRecords; i++) {
    const product = `Product ${i}`;
    const quantity = Math.floor(Math.random() * 100) + 1;
    const unitPrice = (Math.random() * 100).toFixed(2);
    const total = (quantity * unitPrice).toFixed(2);
    const saleDate = new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    ).toISOString();

    yield {
      produto: product,
      quantidade: quantity,
      preco_unitario: unitPrice,
      total: total,
      data_venda: saleDate,
    };
  }
}

export function getSalesDataSync(numRecords) {
  const data = [];
  const generator = generateSalesData(numRecords);
  for (let i = 0; i < numRecords; i++) {
    data.push(generator.next().value);
  }
  return data;
}
