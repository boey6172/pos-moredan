export const formatCurrency = (amount) => {
  return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
};

export const groupProductsByCategory = (products, categoryOrder) => {
  const groups = products.reduce((acc, product) => {
    const categoryName = product.Category?.name || 'Uncategorized';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(product);
    return acc;
  }, {});

  const orderedGroups = {};
  categoryOrder.forEach((category) => {
    if (groups[category]) {
      orderedGroups[category] = groups[category];
    }
  });

  Object.keys(groups).forEach((category) => {
    if (!orderedGroups[category]) {
      orderedGroups[category] = groups[category];
    }
  });

  return orderedGroups;
};

export const calculateSubtotal = (cart) => {
  return cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
};

export const calculateTotal = (subtotal, discount) => {
  return Math.max(0, subtotal - Number(discount || 0));
};

export const handlePrintReceipt = (receiptRef) => {
  if (!receiptRef.current) return;

  const printContents = receiptRef.current.innerHTML;
  const win = window.open('', '', 'width=600,height=800');
  if (!win) return;

  win.document.write(`
    <html>
      <head><title>Receipt</title></head>
      <body>${printContents}</body>
    </html>
  `);
  win.document.close();
  win.print();
};

