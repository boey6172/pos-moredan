import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

const STORE_TITLE = 'Uno Laundry Hub';

/** Screen preview base; print window overrides with mm-based rules in handlePrintReceipt */
const rootStyle = {
  fontFamily: 'Consolas, "Courier New", "Liberation Mono", monospace',
  fontSize: 10,
  lineHeight: 1.15,
  color: '#000',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  margin: 0,
  padding: '0.35em 0.45em',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
  wordWrap: 'break-word',
  overflowWrap: 'anywhere',
};

const R = ({ children, style = {}, ...rest }) => (
  <div style={{ ...style }} {...rest}>
    {children}
  </div>
);

const dashLine = (style = {}) => (
  <R
    style={{
      margin: '0.25em 0',
      borderTop: '1px dashed #000',
      height: 0,
      lineHeight: 0,
      ...style,
    }}
  />
);

/**
 * Compact thermal-style layout. Width is 100% of the printable area so any roll/A4/narrow
 * thermal driver can size the page; fonts use em so print CSS can scale the root in mm.
 */
function ThermalReceiptBody({ lastReceipt, formatCurrency }) {
  if (!lastReceipt) return null;

  const rowBetween = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '0.35em',
    marginTop: '0.08em',
    marginBottom: 0,
  };

  return (
    <div
      id="thermal-receipt"
      className="thermal-receipt"
      style={rootStyle}
    >
      <R style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.15em', marginBottom: '0.15em' }}>
        {STORE_TITLE}
      </R>
      <R style={{ textAlign: 'center', fontSize: '0.92em', lineHeight: 1.1, marginBottom: '0.35em' }}>
        SALES RECEIPT
      </R>

      {dashLine()}

      <R style={{ marginTop: '0.25em', marginBottom: '0.08em' }}>
        <div style={rowBetween}>
          <span>Date</span>
          <span style={{ textAlign: 'right' }}>{lastReceipt.date}</span>
        </div>
        <div style={rowBetween}>
          <span>Trans #</span>
          <span style={{ textAlign: 'right' }}>{lastReceipt.transactionId}</span>
        </div>
        {lastReceipt.customerName ? (
          <div style={{ ...rowBetween, marginTop: '0.2em' }}>
            <span>Customer</span>
            <span style={{ textAlign: 'right', maxWidth: '58%', wordBreak: 'break-word' }}>
              {lastReceipt.customerName}
            </span>
          </div>
        ) : null}
      </R>

      {dashLine({ marginTop: '0.35em' })}

      <R style={{ fontWeight: 700, marginTop: '0.35em', marginBottom: '0.15em' }}>ITEMS</R>
      {lastReceipt.items.map((item) => {
        const qty = item.quantity || 1;
        const unit = parseFloat(item.price) || 0;
        const lineTotal = unit * qty;
        return (
          <div key={item.id} style={{ marginBottom: '0.45em' }}>
            <div>{item.name}</div>
            <div style={rowBetween}>
              <span>
                {qty} × {formatCurrency(unit)}
              </span>
              <span style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(lineTotal)}</span>
            </div>
          </div>
        );
      })}

      {dashLine()}

      {lastReceipt.subtotal !== undefined && (
        <>
          <div style={rowBetween}>
            <span>Subtotal</span>
            <span>{formatCurrency(lastReceipt.subtotal)}</span>
          </div>
          {lastReceipt.discount > 0 && (
            <div style={rowBetween}>
              <span>Discount</span>
              <span>-{formatCurrency(lastReceipt.discount)}</span>
            </div>
          )}
        </>
      )}

      <div
        style={{
          ...rowBetween,
          marginTop: '0.35em',
          fontWeight: 800,
          fontSize: '1.12em',
        }}
      >
        <span>TOTAL</span>
        <span>{formatCurrency(lastReceipt.total)}</span>
      </div>

      {dashLine({ marginTop: '0.35em' })}

      <R style={{ fontWeight: 700, marginTop: '0.25em', marginBottom: '0.15em' }}>PAYMENT</R>
      {lastReceipt.payments && Array.isArray(lastReceipt.payments) ? (
        lastReceipt.payments.map((payment, idx) => (
          <div key={idx} style={rowBetween}>
            <span style={{ textTransform: 'uppercase' }}>{payment.method}</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
        ))
      ) : (
        <div style={rowBetween}>
          <span>MOP</span>
          <span>{lastReceipt.mop || 'N/A'}</span>
        </div>
      )}

      {lastReceipt.cashReceived != null && Number.isFinite(Number(lastReceipt.cashReceived)) && (
        <>
          <div style={rowBetween}>
            <span>Cash rcvd</span>
            <span>{formatCurrency(lastReceipt.cashReceived)}</span>
          </div>
          {lastReceipt.changeDue != null && lastReceipt.changeDue > 0 && (
            <div style={{ ...rowBetween, fontWeight: 800 }}>
              <span>CHANGE</span>
              <span>{formatCurrency(lastReceipt.changeDue)}</span>
            </div>
          )}
          {lastReceipt.changeDue === 0 && (
            <div style={{ ...rowBetween, fontSize: '0.92em' }}>
              <span>Change</span>
              <span>0.00 (exact)</span>
            </div>
          )}
        </>
      )}

      {dashLine({ marginTop: '0.5em' })}

      <R style={{ textAlign: 'center', fontSize: '0.82em', lineHeight: 1.2, marginTop: '0.35em' }}>
        Thank you — please come again
      </R>
    </div>
  );
}

const ReceiptDialog = ({ open, onClose, lastReceipt, onPrint, receiptRef }) => {
  const formatCurrency = (amount) => {
    return `₱${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ py: 1.5, fontSize: '1rem' }}>Receipt</DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 1, px: 1 }}>
          {lastReceipt ? (
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 1,
                py: 0.5,
                px: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                maxWidth: { xs: '100%', sm: 360 },
                width: '100%',
                mx: 'auto',
              }}
            >
              <ThermalReceiptBody lastReceipt={lastReceipt} formatCurrency={formatCurrency} />
            </Box>
          ) : (
            <Box sx={{ fontSize: '0.875rem' }}>No receipt available</Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={onPrint} variant="contained" size="small">
            Print
          </Button>
        </DialogActions>
      </Dialog>
      <div ref={receiptRef} style={{ display: 'none' }} aria-hidden="true">
        {lastReceipt ? (
          <ThermalReceiptBody lastReceipt={lastReceipt} formatCurrency={formatCurrency} />
        ) : null}
      </div>
    </>
  );
};

export default ReceiptDialog;
