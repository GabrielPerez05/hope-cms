-- SQL view: product_current_price
-- Shows the latest price entry per product from priceHist

CREATE OR REPLACE VIEW product_current_price AS
SELECT
       p.prodcode,
       p.description,
       p.unit,
       ph.effdate,
       ph.unitprice
FROM product p
JOIN priceHist ph
  ON p.prodcode = ph.prodcode
WHERE ph.effdate = (
    SELECT MAX(ph2.effdate)
    FROM priceHist ph2
    WHERE ph2.prodcode = p.prodcode
);
