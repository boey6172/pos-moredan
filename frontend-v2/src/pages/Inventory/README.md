# Inventory Module

This module provides inventory management functionality with two main features:

## Structure

```
Inventory/
├── index.js                    # Main component with tabs
├── components/
│   ├── ProductManagement.js   # Product inventory management (add/remove stock)
│   └── InventoryHistory.js    # Inventory movement history
└── README.md                   # This file
```

## Features

### 1. Product Management Tab
- View all products with their current inventory levels
- Add stock to products
- Remove stock from products
- Add reason/notes for inventory adjustments
- Real-time inventory updates

### 2. Inventory History Tab
- View all inventory movements (additions and removals)
- Filter by date
- Filter by movement type (in/out)
- View movement details including:
  - Date and time
  - Product name
  - Movement type
  - Quantity
  - Notes/reason
  - User who made the adjustment

## API Endpoints Used

- `GET /api/products` - Fetch all products
- `POST /api/inventory/adjust` - Adjust inventory (add/remove stock)
- `GET /api/inventory/movements` - Fetch inventory movement history

## Components

### ProductManagement
Manages product inventory levels. Allows users to:
- View products and their current stock
- Add stock with a reason
- Remove stock with a reason
- Validates quantity inputs

### InventoryHistory
Displays the history of all inventory movements. Features:
- Date filtering (single date)
- Type filtering (in/out)
- Displays product, user, quantity, and notes
- Color-coded movement types (green for in, red for out)

