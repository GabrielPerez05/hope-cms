-- Verify Customer table row count (should be 82)
SELECT COUNT(*) AS customer_count FROM customer;

-- Verify Sales table row count (should be 124)
SELECT COUNT(*) AS sales_count FROM sales;

-- Verify SalesDetail table row count (~250 rows expected)
SELECT COUNT(*) AS salesdetail_count FROM salesDetail;

-- Verify Product table row count (should be 52)
SELECT COUNT(*) AS product_count FROM product;

-- Verify PriceHist table row count (~70 rows expected)
SELECT COUNT(*) AS pricehist_count FROM priceHist;

-- Verify Payments are linked to valid Sales transactions
SELECT COUNT(*) AS invalid_payments
FROM payment p
WHERE NOT EXISTS (
  SELECT 1 FROM sales s WHERE s.transNo = p.transNo
);

-- Verify SalesDetail rows reference valid Sales and Products
SELECT COUNT(*) AS invalid_salesdetail
FROM salesDetail sd
WHERE NOT EXISTS (
  SELECT 1 FROM sales s WHERE s.transNo = sd.transNo
)
OR NOT EXISTS (
  SELECT 1 FROM product pr WHERE pr.prodCode = sd.prodCode
);

-- Verify PriceHist rows reference valid Products
SELECT COUNT(*) AS invalid_pricehist
FROM priceHist ph
WHERE NOT EXISTS (
  SELECT 1 FROM product pr WHERE pr.prodCode = ph.prodCode
);

-- Verify SUPERADMIN exists and has all 9 rights
SELECT ur.user_email, COUNT(*) AS rights_assigned
FROM user_module_rights ur
WHERE ur.user_email = 'jcesperanza@neu.edu.ph'
GROUP BY ur.user_email;
