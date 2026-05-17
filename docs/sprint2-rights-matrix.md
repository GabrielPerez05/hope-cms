# Sprint 2 Rights Matrix

The Sprint 2 rights matrix is `3 user types x 9 rights = 27 cases`.
Automated coverage lives in `src/test/sprint2-rights-27-cases.test.jsx`.

| User Type | Single Enabled Right | Result |
| --- | --- | --- |
| USER | CUST_VIEW | Pass |
| USER | CUST_ADD | Pass |
| USER | CUST_EDIT | Pass |
| USER | CUST_DEL | Pass |
| USER | SALES_VIEW | Pass |
| USER | SD_VIEW | Pass |
| USER | PROD_VIEW | Pass |
| USER | PRICE_VIEW | Pass |
| USER | ADM_USER | Pass |
| ADMIN | CUST_VIEW | Pass |
| ADMIN | CUST_ADD | Pass |
| ADMIN | CUST_EDIT | Pass |
| ADMIN | CUST_DEL | Pass |
| ADMIN | SALES_VIEW | Pass |
| ADMIN | SD_VIEW | Pass |
| ADMIN | PROD_VIEW | Pass |
| ADMIN | PRICE_VIEW | Pass |
| ADMIN | ADM_USER | Pass |
| SUPERADMIN | CUST_VIEW | Pass |
| SUPERADMIN | CUST_ADD | Pass |
| SUPERADMIN | CUST_EDIT | Pass |
| SUPERADMIN | CUST_DEL | Pass |
| SUPERADMIN | SALES_VIEW | Pass |
| SUPERADMIN | SD_VIEW | Pass |
| SUPERADMIN | PROD_VIEW | Pass |
| SUPERADMIN | PRICE_VIEW | Pass |
| SUPERADMIN | ADM_USER | Pass |

Expected behavior verified:

- `CUST_ADD` is the only right that renders Add Customer.
- `CUST_EDIT` is the only right that renders row Edit.
- `CUST_DEL` renders Delete only for `SUPERADMIN`.
- Stamp column is visible only for `ADMIN` and `SUPERADMIN`.
- View-only rights do not render customer mutation controls.
