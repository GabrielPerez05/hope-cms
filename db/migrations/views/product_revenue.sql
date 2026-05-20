-- Author: M3 Lars Ulrich Galamiton
-- product_revenue.sql — SQL view: product_revenue
-- Aggregates total quantity sold and total revenue per product across all
-- salesDetail rows. Revenue = SUM(quantity × unitPrice) using each product's
-- latest priceHist entry, resolved via a MAX(effdate) CTE subquery.
-- Used by the ProductRevenuePage report in Sprint 3.
-- Run after: initial_schema.sql, rights_seed.sql

CREATE OR REPLACE VIEW product_revenue AS
WITH current_price AS (
    SELECT
        ph.prodcode,
        ph.unitprice
    FROM priceHist ph
    WHERE ph.effdate = (
        SELECT MAX(ph2.effdate)
        FROM priceHist ph2
        WHERE ph2.prodcode = ph.prodcode
    )
)
SELECT
       p.prodcode,
       p.description,
       p.unit,
       COALESCE(SUM(sd.quantity), 0) AS total_quantity,
       COALESCE(SUM(sd.quantity * cp.unitprice), 0) AS total_revenue
FROM product p
LEFT JOIN salesDetail sd
  ON p.prodcode = sd.prodcode
LEFT JOIN current_price cp
  ON p.prodcode = cp.prodcode
GROUP BY p.prodcode, p.description, p.unit;
