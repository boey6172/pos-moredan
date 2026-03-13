# Point of Sale System - User Guide

Welcome to the Point of Sale (POS) System user guide! This document will help you understand and use every feature in the system. You don't need any technical knowledge to use this guide - it's written in simple, easy-to-understand language.

---

## Table of Contents

1. [Login & Getting Started](#1-login--getting-started)
2. [Dashboard](#2-dashboard)
3. [Point of Sale (POS)](#3-point-of-sale-pos)
4. [Products](#4-products)
5. [Categories](#5-categories)
6. [Inventory](#6-inventory)
7. [Transactions](#7-transactions)
8. [Users](#8-users)
9. [Reports](#9-reports)
10. [Sales Items](#10-sales-items)

---

## 1. Login & Getting Started

### What is this module?
The Login module is where you enter your username and password to access the system.

### How to use it:
1. When you first open the system, you'll see a login screen
2. Enter your **Username** (provided by your administrator)
3. Enter your **Password** (provided by your administrator)
4. Click the **Login** button
5. If your credentials are correct, you'll be taken to the Dashboard

### Important Notes:
- Keep your password secure and don't share it with others
- If you forget your password, contact your administrator to reset it
- You must be logged in to use any part of the system

---

## 2. Dashboard

### What is this module?
The Dashboard is like the main control center of the system. It shows you important information about your business at a glance, such as today's sales, cash status, and alerts.

### How to use it:

#### Starting Cash
Every morning when you open the business:
1. On the Dashboard, you'll see a section asking for "Starting Cash"
2. Count the actual cash in your cash register/drawer
3. Enter that amount in the "Starting Cash" field
4. Click **Save**
5. The system will now track your cash for the day

#### Viewing Today's Summary
The Dashboard automatically shows:
- **Today's Sales**: Total money earned today
- **Transactions**: Number of sales made today
- **Average Transaction**: Average amount per sale
- **Expected Cash**: How much cash you should have (Starting Cash + Cash Sales)

#### Sales by Payment Method
You can see how much money came from:
- Cash payments
- GCash payments
- Card payments
- Other payment methods

This is shown in an easy-to-read bar chart.

#### Sales by Hour
See which hours of the day were busiest using a line chart. This helps you understand customer patterns.

#### Cash Reconciliation (Closing the Day)
At the end of the day:
1. Count the actual cash in your register
2. Look at the Dashboard to see "Expected Cash" (what the system thinks you should have)
3. Click the **Close Day** button
4. Enter the **Actual Cash** amount (the real cash you counted)
5. Optionally add any **Notes** (like "miscounted in morning" or "return made")
6. Click **Close Day**
7. The system will calculate the difference and save it
8. Once closed, you cannot close the day again (this prevents errors)

#### Low Stock Alerts
If any products are running low, you'll see a warning section showing:
- Which products are low
- How many are left in stock
- This helps you know what to reorder

#### Recent Transactions
See a list of the most recent sales, including:
- Customer name
- Amount paid
- Payment method
- Who made the sale (cashier)
- Time of sale

### Tips:
- The Dashboard refreshes automatically every 30 seconds
- You can click the **Refresh** button anytime to update the information
- Always enter starting cash first thing in the morning
- Always close the day before leaving

---

## 3. Point of Sale (POS)

### What is this module?
The POS module is where you actually make sales to customers. It's like a digital cash register where you can add items to a cart and process payments.

### How to use it:

#### Step 1: Enter Customer Name
1. When you open POS, you'll be asked to enter a customer name
2. Type the customer's name (or just "Walk-in" for walk-in customers)
3. Click **Proceed** or press Enter
4. Now you can start adding products

#### Step 2: Adding Products to Cart
You have three ways to add products:

**Method 1: Using Barcode Scanner**
1. Find the "Barcode Scanner" section at the top
2. Scan the product's barcode with a barcode scanner, OR
3. Type the product SKU (Stock Keeping Unit) number manually
4. Press Enter or click **Search**
5. The product will automatically be added to your cart

**Method 2: Clicking Product Cards**
1. Products are organized by categories (like "Hot Coffee", "Pastries", etc.)
2. Click on a category to expand it and see all products in that category
3. Find the product you want
4. Click the **Add to Checkout** button on the product card
5. The product will be added to your cart

**Method 3: Increasing Quantity**
- If a product is already in your cart, clicking "Add to Checkout" again will increase the quantity by 1
- Make sure you have enough stock before adding more

#### Step 3: Managing Your Cart
1. Click the **Checkout** button (usually a floating button at the bottom right)
2. A drawer will open showing all items in your cart
3. In the cart, you can:
   - **Increase quantity**: Click the **+** button next to an item
   - **Decrease quantity**: Click the **-** button next to an item
   - **Remove item**: Click the trash/delete icon
   - **Close cart**: Click the back arrow to return to products

#### Step 4: Applying Discount (Optional)
1. In the cart drawer, you'll see a toggle for "Enable Discount"
2. Turn it on
3. Enter the discount amount in Philippine Pesos (₱)
4. The total will automatically be reduced

#### Step 5: Choosing Payment Method
You have two payment modes:

**Single Payment Mode:**
- Choose one payment method: Cash, Card, GCash, PayMaya, or Bank Transfer
- The entire amount will be paid using that method

**Multi-Payment Mode:**
- Select "Multi" payment mode
- You can split the payment across multiple methods
- For example: ₱100 in Cash + ₱50 in GCash for a ₱150 total
- Click the **+** button to add another payment method
- Continue until the total matches or exceeds the amount due

#### Step 6: Completing the Sale
1. Make sure the cart total matches or exceeds the payment amount
2. Click the **Checkout** button at the bottom of the cart drawer
3. A confirmation dialog will appear
4. Review the total amount
5. Click **Confirm** to complete the sale
6. A receipt will appear showing:
   - All items purchased
   - Quantities and prices
   - Payment methods used
   - Total amount
   - Transaction ID

#### Step 7: Printing Receipt (Optional)
1. After checkout, a receipt dialog will appear
2. Click **Print** to print the receipt
3. Click **Close** when done

#### Starting a New Sale
- After closing the receipt, you'll be asked to enter a new customer name
- The process starts again from Step 1

### Important Tips:
- Always verify quantities before checkout
- Make sure payment totals match the amount due
- Products with no stock cannot be added (the system will warn you)
- The system automatically reduces inventory when you complete a sale
- Double-check cash payments before confirming

### Keyboard Shortcuts:
- **Enter**: Submit customer name or search barcode
- The barcode input field stays focused for quick scanning

---

## 4. Products

### What is this module?
The Products module lets you add, edit, and manage all the products you sell. This includes items like coffee, pastries, snacks, etc.

### How to use it:

#### Viewing Products
- All your products are shown in a table
- You can see: Product Name, Price, SKU, Inventory (stock count), and Category
- Use the **Filter by Category** dropdown at the top right to show only products from a specific category

#### Adding a New Product
1. Click the **Add Product** button
2. A form will appear with the following fields:
   - **Name**: Enter the product name (e.g., "Cafe Latte")
   - **Price**: Enter the selling price in Philippine Pesos (e.g., 150.00)
   - **SKU**: Enter a unique code (Stock Keeping Unit) - this is used for barcode scanning (e.g., "CL001")
   - **Inventory**: Enter how many units you currently have in stock (e.g., 50)
   - **Category**: Select which category this product belongs to (e.g., "Hot Coffee")
   - **Cost to Make**: Enter how much it costs you to make/procure this product (optional, for profit tracking)
   - **Image**: Click "Upload Image" to add a product photo (optional)
3. Click **Save** to add the product

#### Editing a Product
1. Find the product in the table
2. Click the **Edit** button next to it
3. The same form will appear, but with current values filled in
4. Change any fields you want to update
5. Click **Save** to update the product

#### Deleting a Product
1. Find the product in the table
2. Click the **Delete** button next to it
3. Confirm the deletion when asked
4. ⚠️ **Warning**: Deleting a product cannot be undone! Make sure you really want to delete it.

### Tips:
- SKU codes should be unique for each product
- Keep prices updated if costs change
- Regularly update inventory counts (or use the Inventory module for adjustments)
- Upload images to help staff identify products in the POS system

---

## 5. Categories

### What is this module?
Categories help you organize your products into groups. Examples: "Hot Coffee", "Pastries", "Snacks", etc. This makes it easier to find products in the POS system.

### How to use it:

#### Viewing Categories
- All categories are shown in a table
- You can see the category Name and Description

#### Adding a New Category
1. Click the **Add Category** button
2. A form will appear:
   - **Name**: Enter the category name (e.g., "Iced Coffee")
   - **Description**: Enter a brief description (e.g., "Cold coffee beverages")
3. Click **Save** to add the category

#### Editing a Category
1. Find the category in the table
2. Click the **Edit** button next to it
3. Update the name or description
4. Click **Save**

#### Deleting a Category
1. Find the category in the table
2. Click the **Delete** button next to it
3. Confirm the deletion
4. ⚠️ **Warning**: Make sure no products are using this category before deleting, or they will become "Uncategorized"

### Tips:
- Use clear, descriptive category names
- Keep categories organized to match your menu
- Common categories might include: Hot Coffee, Iced Coffee, Pastries, Snacks, Drinks, Meals, etc.

---

## 6. Inventory

### What is this module?
The Inventory module lets you adjust stock levels when you receive new products or need to correct stock counts.

### How to use it:

#### Viewing Inventory
- All products with their current stock levels are shown in a table
- You can see: Product Name, SKU, and current Inventory count

#### Adding Stock (When You Receive New Items)
1. Find the product in the table
2. Click the **Add Stock** button
3. A dialog will appear:
   - **Quantity**: Enter how many units you're adding (e.g., if you received 20 boxes, enter 20)
   - **Reason**: Enter why you're adding stock (e.g., "New delivery", "Stock adjustment", "Found in storage")
4. Click **Save**
5. The inventory count will increase by the amount you entered

#### Removing Stock (For Damage, Loss, or Corrections)
1. Find the product in the table
2. Click the **Remove Stock** button
3. A dialog will appear:
   - **Quantity**: Enter how many units to remove
   - **Reason**: Enter why you're removing stock (e.g., "Damaged", "Expired", "Stock correction", "Theft")
4. Click **Save**
5. The inventory count will decrease by the amount you entered

### Important Notes:
- The system automatically reduces inventory when products are sold in the POS
- You only need to manually adjust inventory for:
  - Receiving new stock
  - Damaged/expired items
  - Stock discrepancies (found more or less than expected)
  - Theft or loss
- Always enter a reason for your records
- Be careful when removing stock - you cannot undo this action

### Tips:
- Do regular inventory counts to keep stock accurate
- Use the Dashboard's "Low Stock Alerts" to know when to reorder
- Keep detailed reasons for audit purposes

---

## 7. Transactions

### What is this module?
The Transactions module shows you all sales that have been made. You can view, edit, or delete transactions here.

### How to use it:

#### Viewing Transactions
- All transactions are shown in a table
- You can see: Date, Customer Name, Cashier, Payment Method (MOP), Total, and number of Items

#### Filtering by Date Range
1. Use the **From date** and **To date** fields at the top
2. Select the start date and end date you want to see
3. Click **Apply** to filter
4. Click **Clear** to remove filters and show all transactions

#### Viewing Transaction Details
1. Find the transaction in the table
2. Click the **View** button
3. A dialog will show:
   - All items in that transaction
   - Quantities and prices
   - Payment methods used
   - Total amount

#### Editing a Transaction
1. Find the transaction in the table
2. Click the **Edit** button
3. A dialog will appear showing all items
4. You can:
   - **Change quantity**: Enter a new number in the quantity field
   - **Remove items**: Click the trash icon next to an item
   - **Add new products**: 
     - Use the search box at the bottom to find a product
     - Select a product from the dropdown
     - Click the **+** button to add it
   - **Change payment method**: Select a different payment method from the dropdown
5. The total will update automatically
6. Click **Save Changes** when done

#### Deleting a Transaction
1. Find the transaction in the table
2. Click the **Delete** button
3. Confirm the deletion
4. ⚠️ **Warning**: This will permanently delete the transaction and restore inventory. Only delete if absolutely necessary (e.g., entered by mistake).

### Important Notes:
- Editing a transaction will automatically adjust inventory
- If you reduce quantities, stock goes back up
- If you add items, stock goes down
- Deleting a transaction returns all items to inventory
- Be careful when editing or deleting - it affects your sales records

### Tips:
- Use date filters to find specific transactions quickly
- Check transaction details if customers have questions about their receipt
- Keep transaction edits to a minimum for accurate records

---

## 8. Users

### What is this module?
The Users module lets administrators manage who can access the system. You can add new users, change their roles, or reset passwords.

### How to use it:

#### Viewing Users
- All users are shown in a table
- You can see: Username and Role (like "admin" or "cashier")

#### Adding a New User
1. Click the **Add User** button
2. A form will appear:
   - **Username**: Enter a unique username for the new user
   - **Role**: Select either "admin" or "cashier"
     - **Admin**: Can access all modules including Users, Reports, and Settings
     - **Cashier**: Can access POS, view transactions, but cannot manage users or see all reports
   - **Password**: Enter a secure password for the new user
3. Click **Save** to create the user
4. Give the username and password to the new user so they can login

#### Editing a User
1. Find the user in the table
2. Click the **Edit** button
3. You can change:
   - Username
   - Role (admin or cashier)
4. Note: You cannot change the password here (use "Reset Password" instead)
5. Click **Save**

#### Resetting a User's Password
1. Find the user in the table
2. Click the **Reset Password** button
3. A dialog will appear asking for a new password
4. Enter the new password
5. Click **Reset**
6. Tell the user their new password so they can login

#### Deleting a User
1. Find the user in the table
2. Click the **Delete** button
3. Confirm the deletion
4. ⚠️ **Warning**: This will permanently remove the user's access. They won't be able to login anymore.

### Important Notes:
- Only administrators should manage users
- Always use strong passwords (mix of letters, numbers, symbols)
- When resetting passwords, communicate the new password securely to the user
- Don't delete users unless they no longer work for the business

### Tips:
- Create separate accounts for each staff member (don't share accounts)
- Use roles to limit access appropriately
- Keep a record of usernames for reference

---

## 9. Reports

### What is this module?
The Reports module provides detailed insights about your business performance. It includes sales reports, top-selling products, and low stock alerts.

### How to use it:

The Reports module has three main tabs:

#### Tab 1: Sales Report

**What it shows:**
- Sales trends over time (daily, weekly, or monthly)
- Total sales, transactions, and average sale amounts
- Breakdown by payment method (Cash, GCash, etc.)

**How to use it:**
1. Select a **Period** from the dropdown:
   - **Daily**: Shows sales for each day
   - **Weekly**: Shows sales for each week
   - **Monthly**: Shows sales for each month
2. (Optional) Set **Start Date** and **End Date** to view a specific date range
3. The chart will update automatically showing:
   - A line chart with sales trends
   - Summary cards with totals
   - A detailed table below with all the numbers

**Understanding the data:**
- **Total Sales**: Total money earned in the period
- **Total Transactions**: Number of sales made
- **Average Sale**: Total Sales divided by Total Transactions
- **Gcash Sales**: Money from GCash payments
- **Cash Sales**: Money from cash payments

#### Tab 2: Top Products Report

**What it shows:**
- Which products sell the most
- How many units of each product were sold

**How to use it:**
1. Select a **Limit** from the dropdown (Top 5, Top 10, Top 15, or Top 20)
2. The charts will show:
   - A bar chart comparing product sales
   - A pie chart showing distribution
   - A table with details including current stock levels

**Understanding the data:**
- Products are ranked by quantity sold
- You can see current stock vs. quantity sold
- This helps identify bestsellers and what to order more of

#### Tab 3: Low Stock Report

**What it shows:**
- Products that are running low or out of stock

**How to use it:**
1. Select a **Threshold** (5, 10, 15, or 20)
   - This means "show products with stock less than or equal to this number"
2. A table will show:
   - Product name and SKU
   - Category
   - Current stock level (with color coding: red = out of stock, yellow = low stock)
   - Price
   - Status

**Understanding the data:**
- **Threshold of 10**: Shows products with 10 items or less
- Use this to know what to reorder before you run out
- Red chips mean the product is out of stock (0 items)

### Tips:
- Check reports regularly to understand business trends
- Use Top Products to decide what to promote or order more of
- Use Low Stock report weekly to plan purchasing
- Sales reports help you see busy days/times and plan staffing

---

## 10. Sales Items

### What is this module?
The Sales Items module shows detailed information about every item that was sold, organized by category. This is useful for analyzing which specific products are selling well.

### How to use it:

#### Viewing Sales Items
1. The module shows sales grouped by **Category**
2. Each category can be expanded to see all items sold in that category

#### Filtering by Date Range
1. Use the **From Date** and **To Date** fields at the top
2. Select your desired date range
3. Click **Apply Filter** to update the data
4. Click **Clear** to remove filters

#### Understanding the Display

**Summary Cards (at the top):**
- **Total Categories**: How many categories had sales
- **Total Items Sold**: Total quantity of all products sold
- **Total Revenue**: Total money from all sales in the date range

**Category Sections:**
- Each category is shown in an expandable section (Accordion)
- Click on a category to expand it and see details
- Each category shows:
  - Total quantity sold in that category
  - Total revenue from that category

**Item Details (inside each category):**
- **Product Name**: What was sold
- **SKU**: Product code
- **Quantity**: How many were sold
- **Unit Price**: Price per item
- **Subtotal**: Quantity × Unit Price
- **Transaction Date**: When it was sold
- **Customer**: Who bought it
- **MOP**: Payment method used (Cash, GCash, etc.)

**Category Totals (at bottom of each category):**
- Shows the total quantity and revenue for that category

### Tips:
- Use this to see detailed sales by product
- Helpful for inventory planning - see what's selling vs. what's not
- Filter by date ranges to analyze specific periods
- Use the category totals to see which categories generate most revenue

---

## Quick Reference Guide

### Daily Workflow:
1. **Morning**: Login → Dashboard → Enter Starting Cash
2. **Throughout Day**: POS → Make Sales → Check Inventory if needed
3. **End of Day**: Dashboard → Close Day → Enter Actual Cash
4. **Weekly**: Check Reports → Review Sales → Check Low Stock

### Common Tasks:

| Task | Module | Steps |
|------|--------|-------|
| Make a sale | POS | Enter customer → Add products → Checkout → Select payment → Confirm |
| Add new product | Products | Click "Add Product" → Fill form → Save |
| Adjust stock | Inventory | Find product → Click "Add Stock" or "Remove Stock" → Enter quantity and reason → Save |
| Check today's sales | Dashboard | View "Today's Sales" card at top |
| View all sales | Transactions | Use date filters → Click "View" on any transaction |
| See what's selling | Reports → Top Products | Select limit → View chart and table |
| Find low stock items | Reports → Low Stock | Select threshold → Review table |

---

## Troubleshooting

### Problem: Can't login
**Solution**: Check username and password. Contact administrator if you forgot your password.

### Problem: Product shows as "out of stock" but I know we have it
**Solution**: Go to Inventory module → Find product → Click "Add Stock" → Enter correct quantity and reason.

### Problem: Wrong amount in cart
**Solution**: Check quantities in cart. Remove items or adjust quantities before checkout.

### Problem: Can't close the day
**Solution**: Make sure you entered actual cash amount. Check if day was already closed.

### Problem: Can't find a transaction
**Solution**: Use date filters in Transactions module. Check if you're looking at the correct date range.

### Problem: Dashboard shows wrong cash amount
**Solution**: Verify starting cash was entered correctly. Check all cash sales were entered properly.

---

## Security Reminders

- **Never share your password** with anyone
- **Log out** when you're done using the system
- **Only authorized users** should access the system
- **Back up important data** regularly (if you have admin access)
- **Report suspicious activity** to your administrator immediately

---

## Getting Help

If you encounter any issues or have questions:
1. Check this guide first
2. Ask your administrator or manager
3. Contact technical support if needed

---

**Last Updated**: 2024
**Version**: 1.0

This guide covers all modules in the Point of Sale system. Keep it handy for reference!








