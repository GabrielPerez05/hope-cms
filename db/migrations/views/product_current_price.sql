-- SQL view: product_current_price
-- Shows the latest price entry per product from priceHist

CREATE OR REPLACE VIEW product_current_price AS
SELECT p.productid,
       p.productname,
       ph.price,
       ph.effective_date
FROM product p
JOIN priceHist ph
  ON p.productid = ph.productid
WHERE ph.effective_date = (
    SELECT MAX(ph2.effective_date)
    FROM priceHist ph2
    WHERE ph2.productid = p.productid
);
