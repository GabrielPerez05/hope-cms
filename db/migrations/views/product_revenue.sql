-- SQL view: product_revenue
-- Shows total revenue per product using latest price

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
