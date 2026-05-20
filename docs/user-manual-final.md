# Hope CMS — User Manual

**Hope, Inc. | Customer Management System**
Version 1.0 — Sprint 3 Final Release

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Accessing the Application](#2-accessing-the-application)
3. [Registration](#3-registration)
4. [Login](#4-login)
5. [Navigation Overview](#5-navigation-overview)
6. [Customer Management](#6-customer-management)
7. [Sales History](#7-sales-history)
8. [Product Catalogue](#8-product-catalogue)
9. [Reports](#9-reports)
10. [Admin Module](#10-admin-module)
11. [Deleted Customers](#11-deleted-customers)
12. [User Roles and Permissions](#12-user-roles-and-permissions)

---

## 1. Introduction

Hope CMS is a web-based customer and sales management system built for Hope, Inc. It provides role-based access to customer records, sales transactions, product information, and administrative tools. All data is stored securely in a cloud database with row-level security enforced at the server.

---

## 2. Accessing the Application

Open a web browser and navigate to the production URL provided by your administrator.

[Screenshot: Browser showing the Hope CMS login page]

If you do not have an account, proceed to Registration. If you already have an account, proceed to Login.

---

## 3. Registration

### 3.1 Email Registration

1. On the login page, click **Create an account**.
2. Enter your **email address** and a **password** (minimum 6 characters).
3. Click **Sign Up**.
4. A confirmation email will be sent to your address. Click the link in the email to verify your account.
5. After verification, you will be redirected to the app. Your account will show a **pending activation** notice.

[Screenshot: Registration form with email and password fields]

[Screenshot: Pending activation screen after registration]

> **Note:** New accounts are created with INACTIVE status. A Sales Manager or Administrator must activate your account before you can access the system.

### 3.2 Google OAuth Registration

1. On the login page, click **Sign in with Google**.
2. Select your Google account and grant permission.
3. You will be redirected back to the app with a pending activation notice.

[Screenshot: Google OAuth sign-in button on the login page]

> **Note:** The same activation requirement applies to Google-registered accounts.

---

## 4. Login

### 4.1 Email Login

1. Go to the login page.
2. Enter your registered **email** and **password**.
3. Click **Sign In**.

[Screenshot: Login form filled in]

If your account has not been activated, you will see a notice explaining that your account is pending activation. Contact your administrator.

### 4.2 Google Login

1. Click **Sign in with Google** on the login page.
2. Select your Google account.
3. You will be signed in and redirected to the main dashboard.

[Screenshot: Successful login — main dashboard view]

---

## 5. Navigation Overview

After logging in, the sidebar on the left shows the pages available to your account. Pages are shown or hidden based on your user type and assigned rights.

[Screenshot: Sidebar navigation showing available links]

| Link | Who can see it |
|------|----------------|
| Customers | ADMIN, SUPERADMIN, or users with CUST_VIEW |
| Sales | ADMIN, SUPERADMIN, or users with SALES_VIEW |
| Products | ADMIN, SUPERADMIN, or users with PROD_VIEW |
| Customer Summary | SUPERADMIN or users with PRICE_VIEW |
| Top Customers | SUPERADMIN or users with PRICE_VIEW |
| Product Revenue | SUPERADMIN or users with PRICE_VIEW |
| Admin | ADMIN, SUPERADMIN, or users with ADM_USER |
| Deleted Customers | ADMIN and SUPERADMIN only |

---

## 6. Customer Management

### 6.1 Viewing the Customer List

Navigate to **Customers** in the sidebar. The list shows all active customers with their customer number, name, address, payment term, and last activity stamp.

[Screenshot: Customers page showing a list of active customers]

Use the **search bar** to filter customers by name or customer number. Use the **pagination controls** at the bottom to navigate between pages.

### 6.2 Adding a Customer

> Requires CUST_ADD right or ADMIN/SUPERADMIN role.

1. Click the **Add Customer** button at the top right.
2. Fill in the **Customer No**, **Name**, **Address**, and **Payment Term** fields.
3. Click **Save**.

[Screenshot: Add Customer form]

### 6.3 Editing a Customer

> Requires CUST_EDIT right or ADMIN/SUPERADMIN role.

1. Click the **edit icon** on any customer row.
2. Modify the desired fields.
3. Click **Save**.

[Screenshot: Edit Customer form with pre-filled fields]

The stamp column will update to show who edited the record and when.

### 6.4 Viewing Customer Detail

Click on any **customer number** to open the Customer Detail page. This shows the full customer information and their complete sales history.

[Screenshot: Customer Detail page]

### 6.5 Soft Deleting a Customer

> Requires SUPERADMIN role with CUST_DEL right.

1. Click the **delete icon** on the customer row.
2. Enter a reason for deletion in the dialog.
3. Click **Confirm Delete**.

[Screenshot: Delete confirmation dialog with reason field]

The customer will be removed from the active list and moved to Deleted Customers. This is a soft delete — no data is permanently removed.

### 6.6 Recovering a Customer

> Requires ADMIN or SUPERADMIN role.

Soft-deleted customers show a **Recover** button in their row. Click it to restore the customer to active status.

[Screenshot: Recover button on a soft-deleted customer row]

### 6.7 Reverting a Customer Edit

> Requires SUPERADMIN role.

If a customer record was recently edited, a **Revert** button (amber) appears on the row. Click it to restore the customer values from before the last edit.

[Screenshot: Revert button on a recently edited customer row]

---

## 7. Sales History

Navigate to **Sales** in the sidebar. The page shows all sales transactions with order number, customer, date, and total amount.

[Screenshot: Sales page showing the transactions list]

### 7.1 Viewing Sales Detail

Click on any **order number** to expand its line items. Each line shows the product, quantity, unit price, and line total.

[Screenshot: Sales drill-down showing line items for a transaction]

> Sales data is **view-only**. No add, edit, or delete operations are available for any user type.

---

## 8. Product Catalogue

Navigate to **Products** in the sidebar. The page lists all products with their product code, description, unit, and current price.

[Screenshot: Products page showing the product catalogue]

Use the **search bar** to filter by product name or code.

> Product data is **view-only** for all user types.

---

## 9. Reports

> Reports are visible to SUPERADMIN or users with PRICE_VIEW right.

### 9.1 Customer Sales Summary

Shows each customer total spending, number of transactions, and last order date. Columns are sortable by clicking the header.

[Screenshot: Customer Sales Summary report]

### 9.2 Top Customers

Shows the top 10 customers ranked by total spend.

[Screenshot: Top Customers report]

### 9.3 Product Revenue

Shows each product total revenue across all sales.

[Screenshot: Product Revenue report]

---

## 10. Admin Module

> Accessible to ADMIN, SUPERADMIN, or users with ADM_USER right.

Navigate to **Admin** in the sidebar. The page shows all registered users with their status, type, and assigned rights.

[Screenshot: Admin page showing user list]

### 10.1 Activating / Deactivating a User

- Click **Activate** to allow a pending or inactive user to log in.
- Click **Deactivate** to suspend an active user access.

[Screenshot: Activate and Deactivate buttons on a user row]

> ADMIN can only activate/deactivate USER accounts. SUPERADMIN accounts cannot be modified by anyone.

### 10.2 Promoting / Demoting a User

> SUPERADMIN only.

Use the **role dropdown** on a user row to change their type between USER and ADMIN. Rights are automatically reset to match the new role.

[Screenshot: Role dropdown on a user row]

### 10.3 Customizing Rights

> SUPERADMIN only.

Individual rights checkboxes can be toggled to grant or revoke specific permissions beyond the role default.

[Screenshot: Rights checkboxes on a user card]

> SUPERADMIN rows are fully locked — no controls are active for SUPERADMIN accounts.

---

## 11. Deleted Customers

> Accessible to ADMIN and SUPERADMIN only.

Navigate to **Deleted Customers** in the sidebar. The page shows all soft-deleted customers including the reason and timestamp of deletion.

[Screenshot: Deleted Customers page]

Click **Recover** to restore a customer to the active list.

---

## 12. User Roles and Permissions

### User Types

| Type | Description |
|------|-------------|
| USER | Standard account. Access determined entirely by assigned rights. |
| ADMIN | Can manage USER accounts. Cannot soft-delete customers or modify ADMIN/SUPERADMIN accounts. |
| SUPERADMIN | Full access. Can promote/demote users, soft-delete customers, revert edits, and manage all rights. Cannot be modified by anyone. |

### Rights Reference

| Right | What it unlocks |
|-------|----------------|
| CUST_VIEW | View the Customers page |
| CUST_ADD | Add new customers |
| CUST_EDIT | Edit existing customers |
| CUST_DEL | Soft-delete customers (SUPERADMIN only in practice) |
| SALES_VIEW | View the Sales page |
| SD_VIEW | View sales line item drill-down |
| PROD_VIEW | View the Products page |
| PRICE_VIEW | View the three Reports pages |
| ADM_USER | View and access the Admin module |

---

*Hope CMS — Sprint 3 Final | Hope, Inc. | New Era University BS Information Technology*
