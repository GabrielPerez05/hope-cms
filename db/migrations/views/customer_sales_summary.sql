-- SQL view: customer_sales_summary
-- Summarizes transaction count, total spend, and last sale date per customer.

CREATE OR REPLACE VIEW customer_sales_summary AS
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
),
sales_totals AS (
    SELECT
        s.transno,
        s.custno,
        s.salesdate,
        COALESCE(SUM(sd.quantity * cp.unitprice), 0) AS transaction_total
    FROM sales s
    LEFT JOIN salesDetail sd
      ON s.transno = sd.transno
    LEFT JOIN current_price cp
      ON sd.prodcode = cp.prodcode
    GROUP BY s.transno, s.custno, s.salesdate
)
SELECT
    c.custno,
    c.custname,
    c.record_status,
    COUNT(st.transno) AS transaction_count,
    COALESCE(SUM(st.transaction_total), 0) AS total_spend,
    MAX(st.salesdate) AS last_sale_date
FROM customer c
LEFT JOIN sales_totals st
  ON c.custno = st.custno
GROUP BY c.custno, c.custname, c.record_status;
