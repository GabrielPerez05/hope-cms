-- SQL view: product_revenue
-- Shows total revenue per product using latest price

CREATE OR REPLACE VIEW product_revenue AS
SELECT p.productid,
       p.productname,
       SUM(sd.quantity * ph.price) AS total_revenue
FROM product p
JOIN salesDetail sd
  ON p.productid = sd.productid
JOIN priceHist ph
  ON p.productid = ph.productid
 AND ph.effective_date = (
     SELECT MAX(ph2.effective_date)
     FROM priceHist ph2
     WHERE ph2.productid = p.productid
 )
GROUP BY p.productid, p.productname;
