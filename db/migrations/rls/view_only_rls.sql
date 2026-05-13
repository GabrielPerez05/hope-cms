-- Enable RLS on all four tables
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesDetail ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE priceHist ENABLE ROW LEVEL SECURITY;

-- SELECT-only policy for authenticated users
CREATE POLICY select_sales
ON sales
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY select_salesDetail
ON salesDetail
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY select_product
ON product
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY select_priceHist
ON priceHist
FOR SELECT
TO authenticated
USING (true);
