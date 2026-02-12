export const formatCurrency = (amount) => {
  return `₱${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const calculateTotalSales = (salesData) => {
  return salesData.reduce((sum, item) => sum + parseFloat(item.totalSales || 0), 0);
};

export const calculateTotalTransactions = (salesData) => {
  return salesData.reduce((sum, item) => sum + parseInt(item.transactionCount || 0), 0);
};

export const calculateAverageSale = (salesData) => {
  const totalSales = calculateTotalSales(salesData);
  const totalTransactions = calculateTotalTransactions(salesData);
  return totalTransactions > 0 ? totalSales / totalTransactions : 0;
};

export const formatSalesData = (data) => {
  return data.map((item) => ({
    ...item,
    totalSales: parseFloat(item.totalSales || 0),
    transactionCount: parseInt(item.transactionCount || 0),
  }));
};

export const formatTopProductsData = (data) => {
  return data.map((item) => ({
    ...item,
    totalSold: parseInt(item.totalSold || 0),
    name: item.Product?.name || item.name || 'Unknown',
  }));
};






