# POS Module Structure

This POS module is broken down into reusable components following React best practices and modular architecture.

## File Structure

```
POS/
├── index.js                    # Main POS orchestrator (~300 lines)
├── components/
│   ├── ProductCard.js         # Product display card (~60 lines)
│   ├── BarcodeScanner.js      # Barcode scanning component (~80 lines)
│   ├── CartDrawer.js          # Shopping cart drawer (~200 lines)
│   ├── MultiPaymentManager.js # Multi-payment handling (~120 lines)
│   ├── SinglePaymentSelector.js # Single payment selector (~40 lines)
│   ├── CustomerNameDialog.js  # Customer name input dialog (~50 lines)
│   ├── CheckoutDialog.js      # Checkout confirmation dialog (~40 lines)
│   ├── ReceiptDialog.js       # Receipt display dialog (~80 lines)
│   └── SnackbarNotification.js # Toast notifications (~20 lines)
└── utils/
    ├── constants.js           # Constants (category order, payment methods)
    └── helpers.js             # Utility functions (formatting, calculations)
```

## Component Responsibilities

### Main Components

1. **index.js** - Main orchestrator
   - State management
   - API calls
   - Event handlers
   - Component composition

2. **ProductCard** - Displays individual product
   - Product information
   - Add to cart button
   - Visual feedback when added

3. **BarcodeScanner** - Barcode/SKU scanning
   - Input field for barcode
   - Product lookup by SKU
   - Auto-focus for scanner integration

4. **CartDrawer** - Shopping cart management
   - Cart items display
   - Quantity adjustment
   - Discount management
   - Payment mode selection
   - Checkout button

5. **MultiPaymentManager** - Multi-payment handling
   - Add multiple payment methods
   - Track payment totals
   - Validate payment amounts

6. **SinglePaymentSelector** - Single payment mode
   - Select payment method
   - Display total

### Dialog Components

7. **CustomerNameDialog** - Customer name input
   - Required before checkout
   - Keyboard navigation support

8. **CheckoutDialog** - Checkout confirmation
   - Confirm checkout
   - Display status messages

9. **ReceiptDialog** - Receipt display
   - Show transaction details
   - Print functionality

10. **SnackbarNotification** - Toast notifications
    - Success/error messages
    - Auto-dismiss

## Utilities

### constants.js
- Category ordering
- Payment method options

### helpers.js
- Currency formatting
- Product grouping
- Calculation functions
- Print handling

## Benefits of This Structure

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other contexts
3. **Testability** - Small, focused components are easier to test
4. **Readability** - Code is easier to understand and navigate
5. **Scalability** - Easy to add new features without bloating files

## Usage

The main POS page imports and orchestrates all components:

```javascript
import POS from './pages/POS';

// In App.js routes
<Route path="/pos" element={auth ? <POS /> : <Navigate to="/login" />} />
```

## Features

- ✅ Product selection by category (accordion)
- ✅ Barcode scanning
- ✅ Shopping cart with quantity management
- ✅ Multi-payment support
- ✅ Single payment mode toggle
- ✅ Discount functionality
- ✅ Checkout process
- ✅ Receipt printing
- ✅ Customer name dialog
- ✅ Toast notifications
- ✅ Stock validation
- ✅ Responsive design
- ✅ Accessibility features






