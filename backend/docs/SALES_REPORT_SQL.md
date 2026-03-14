# Sales Report – SQL Equivalent

The sales report in `reportController.getSalesReport` filters transactions by date, groups by period (daily/weekly/monthly), and returns transaction count, total sales, and cash/gcash breakdown. The cash/gcash split comes from parsing the `mop` (mode of payment) column in application code; below is the SQL equivalent.

**Table:** `"Transactions"`  
**Columns used:** `id`, `total`, `mop`, `"createdAt"`

---

## 1. Date filter only (no grouping)

```sql
SELECT id, total, mop, "createdAt"
FROM "Transactions"
WHERE "createdAt" BETWEEN :startDate AND :endDate
ORDER BY "createdAt" ASC;
```

With only start or end:

```sql
-- From startDate onward
WHERE "createdAt" >= :startDate

-- Up to endDate
WHERE "createdAt" <= :endDate
```

---

## 2. Grouped by period (transaction count + total sales)

Cash/gcash breakdown is not included here; it requires parsing the `mop` JSON in app code (or see §3 for a PostgreSQL JSON option).

### Daily

```sql
SELECT
  DATE("createdAt") AS period,
  COUNT(*) AS "transactionCount",
  COALESCE(SUM(total), 0) AS "totalSales"
FROM "Transactions"
WHERE "createdAt" BETWEEN :startDate AND :endDate
GROUP BY DATE("createdAt")
ORDER BY period ASC;
```

### Weekly

```sql
SELECT
  DATE_TRUNC('week', "createdAt")::date AS period,
  COUNT(*) AS "transactionCount",
  COALESCE(SUM(total), 0) AS "totalSales"
FROM "Transactions"
WHERE "createdAt" BETWEEN :startDate AND :endDate
GROUP BY DATE_TRUNC('week', "createdAt")
ORDER BY period ASC;
```

### Monthly

```sql
SELECT
  TO_CHAR("createdAt", 'YYYY-MM') AS period,
  COUNT(*) AS "transactionCount",
  COALESCE(SUM(total), 0) AS "totalSales"
FROM "Transactions"
WHERE "createdAt" BETWEEN :startDate AND :endDate
GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
ORDER BY period ASC;
```

---

## 3. Cash / GCash split in PostgreSQL (optional)

If `mop` is stored as JSON array, e.g. `[{"method":"Cash","amount":100},{"method":"GCash","amount":50}]`, you can approximate the report’s cash/gcash totals with something like this (adjust JSON structure if yours differs):

```sql
WITH payments AS (
  SELECT
    id,
    total,
    "createdAt",
    jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(mop::jsonb) = 'array' THEN mop::jsonb
        ELSE jsonb_build_array(jsonb_build_object('method', mop, 'amount', total))
      END
    ) AS payment
  FROM "Transactions"
  WHERE "createdAt" BETWEEN :startDate AND :endDate
),
parsed AS (
  SELECT
    id,
    total,
    "createdAt",
    LOWER(COALESCE(payment->>'method', 'cash')) AS method,
    COALESCE((payment->>'amount')::numeric, total) AS amount
  FROM payments
)
SELECT
  DATE("createdAt") AS period,
  COUNT(DISTINCT id) AS "transactionCount",
  COALESCE(SUM(CASE WHEN method = 'cash' THEN amount ELSE 0 END), 0) AS "cashSales",
  COALESCE(SUM(CASE WHEN method = 'gcash' THEN amount ELSE 0 END), 0) AS "gcashSales",
  COALESCE(SUM(total), 0) AS "totalSales"
FROM (
  SELECT id, total, "createdAt"
  FROM "Transactions"
  WHERE "createdAt" BETWEEN :startDate AND :endDate
) t
LEFT JOIN parsed p USING (id)
GROUP BY DATE("createdAt")
ORDER BY period ASC;
```

Note: If your `mop` column is plain text (e.g. `'Cash'` or `'GCash'`) and not JSON, the app’s `calculatePaymentMethodTotals` still treats it as a single method; the equivalent would be a simple `CASE` on `mop` instead of JSON parsing.

---

## 4. Parameter placeholders

Use your client’s placeholder style. Examples:

- **Sequelize / Node:** `:startDate`, `:endDate` (with `replacements: { startDate, endDate }`).
- **Direct dates:** replace with quoted dates, e.g. `'2025-01-01'` and `'2025-01-31'`.

Example with literal dates (daily report):

```sql
SELECT
  DATE("createdAt") AS period,
  COUNT(*) AS "transactionCount",
  COALESCE(SUM(total), 0) AS "totalSales"
FROM "Transactions"
WHERE "createdAt" BETWEEN '2025-01-01' AND '2025-01-31'
GROUP BY DATE("createdAt")
ORDER BY period ASC;
```
