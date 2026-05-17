-- Verification queries for Sprint 2/Sprint 3 reporting views.
-- Run after product_current_price.sql, customer_sales_summary.sql, and product_revenue.sql.

SELECT 'product_current_price_rows' AS check_name, COUNT(*)::TEXT AS result
FROM product_current_price
UNION ALL
SELECT 'customer_sales_summary_rows', COUNT(*)::TEXT
FROM customer_sales_summary
UNION ALL
SELECT 'product_revenue_rows', COUNT(*)::TEXT
FROM product_revenue;

SELECT *
FROM product_current_price
ORDER BY prodcode
LIMIT 10;

SELECT *
FROM customer_sales_summary
ORDER BY total_spend DESC, custno
LIMIT 10;

SELECT *
FROM product_revenue
ORDER BY total_revenue DESC, prodcode
LIMIT 10;
