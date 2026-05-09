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

/** Round to 2 decimal places (PHP centavo). */
export const roundMoney = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
};

/** Change to return when tender is greater than amount owed; otherwise 0. */
export const computeChangeDue = (amountReceived, amountOwed) => {
  const received = roundMoney(amountReceived);
  const owed = roundMoney(amountOwed);
  const diff = received - owed;
  return diff > 0 ? roundMoney(diff) : 0;
};

/** How much more cash is needed (0 if tender covers total). */
export const cashShortfall = (amountReceived, amountOwed) => {
  const received = roundMoney(amountReceived);
  const owed = roundMoney(amountOwed);
  const diff = owed - received;
  return diff > 0 ? roundMoney(diff) : 0;
};

/**
 * Opens print preview with styles that fit 58mm / 80mm thermal, A4, or any width the driver exposes.
 * Receipt markup uses #thermal-receipt + em units so scaling the root font scales the whole slip.
 */
export const handlePrintReceipt = (receiptRef) => {
  if (!receiptRef.current) return;

  const printContents = receiptRef.current.innerHTML;
  const win = window.open('', '', 'width=520,height=820');
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt</title>
        <style>
          /* Let the printer driver define paper width (thermal roll, A4, etc.) */
          @page {
            size: auto;
            margin: 2mm;
          }
          html, body {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            box-sizing: border-box;
          }
          /* Fill printable width; text wraps for narrow rolls */
          #thermal-receipt,
          .thermal-receipt {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 1mm 2mm !important;
            box-sizing: border-box !important;
            word-wrap: break-word !important;
            overflow-wrap: anywhere !important;
            /* Physical size tracks paper; tweak if text feels small/large on your printer */
            font-size: 2.5mm !important;
            line-height: 1.18 !important;
          }
          #thermal-receipt *,
          .thermal-receipt * {
            max-width: 100%;
            box-sizing: border-box;
          }
          @media screen {
            body {
              padding: 8px;
              max-width: 100mm;
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);
  win.document.close();
  win.print();
};

