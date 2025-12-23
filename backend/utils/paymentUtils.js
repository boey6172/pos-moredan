/**
 * Payment Utility Functions
 * Handles both old format (single string) and new format (JSON array) payment methods
 */

/**
 * Parse payment methods from mop field
 * Supports both old format (single string) and new format (JSON array)
 */
const parsePaymentMethods = (mop) => {
  if (!mop) return null;
  
  // Try to parse as JSON (new format)
  try {
    const parsed = JSON.parse(mop);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    // Not JSON, treat as old format (single string)
  }
  
  // Old format: return as single payment method
  return [{ method: mop, amount: null }];
};

/**
 * Calculate sales by payment method from a transaction
 * Returns an object with payment method totals
 */
const calculatePaymentMethodTotals = (transaction) => {
  const amount = parseFloat(transaction.total || 0);
  const payments = parsePaymentMethods(transaction.mop);
  
  const totals = {
    cash: 0,
    gcash: 0,
    card: 0,
    paymaya: 0,
    bankTransfer: 0,
    other: 0
  };
  
  if (!payments) {
    return totals;
  }
  
  payments.forEach(payment => {
    const paymentAmount = payment.amount !== null ? parseFloat(payment.amount) : amount;
    const method = (payment.method || '').toLowerCase();
    
    if (method === 'cash') {
      totals.cash += paymentAmount;
    } else if (method === 'gcash') {
      totals.gcash += paymentAmount;
    } else if (method === 'card') {
      totals.card += paymentAmount;
    } else if (method === 'paymaya') {
      totals.paymaya += paymentAmount;
    } else if (method === 'bank transfer') {
      totals.bankTransfer += paymentAmount;
    } else {
      totals.other += paymentAmount;
    }
  });
  
  return totals;
};

/**
 * Check if transaction is cash payment (for reconciliation)
 * Returns true if any payment method is Cash
 */
const isCashTransaction = (transaction) => {
  const payments = parsePaymentMethods(transaction.mop);
  if (!payments) return false;
  
  return payments.some(p => (p.method || '').toLowerCase() === 'cash');
};

/**
 * Get cash amount from transaction
 * Returns the cash portion of the payment
 */
const getCashAmount = (transaction) => {
  const payments = parsePaymentMethods(transaction.mop);
  if (!payments) return 0;
  
  let cashAmount = 0;
  payments.forEach(payment => {
    if ((payment.method || '').toLowerCase() === 'cash') {
      const amount = payment.amount !== null ? parseFloat(payment.amount) : parseFloat(transaction.total || 0);
      cashAmount += amount;
    }
  });
  
  return cashAmount;
};

/**
 * Get non-cash amount from transaction
 * Returns the non-cash portion of the payment
 */
const getNonCashAmount = (transaction) => {
  const total = parseFloat(transaction.total || 0);
  return total - getCashAmount(transaction);
};

module.exports = {
  parsePaymentMethods,
  calculatePaymentMethodTotals,
  isCashTransaction,
  getCashAmount,
  getNonCashAmount
};


