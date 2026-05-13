-- SQL view: customer_sales_summary
-- Shows each customer's total transactions and total spend

CREATE OR REPLACE VIEW customer_sales_summary AS
SELECT c.customerid,
       c.customername,
       COUNT(DISTINCT s.salesid) AS total_transactions,
       SUM(sd.quantity * ph.price) AS total_spend
FROM customer c
JOIN sales s
  ON c.customerid = s.customerid
JOIN salesDetail sd
  ON s.salesid = sd.salesid
JOIN product p
  ON sd.productid = p.productid
JOIN priceHist ph
  ON p.productid = ph.productid
 AND ph.effective_date = (
     SELECT MAX(ph2.effective_date)
     FROM priceHist ph2
     WHERE ph2.productid = p.productid
 )
GROUP BY c.customerid, c.customername;
