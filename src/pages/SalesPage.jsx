import { useEffect, useMemo, useState } from "react";
import {
  DataErrorBoundary,
  DataErrorState,
  DataLoadingState,
} from "../components/DataStates";
import {
  Pagination,
} from "../components/Pagination";
import {
  PAGE_SIZE,
  clampPage,
  getPageItems,
} from "../lib/pagination";
import { getCustomers } from "../lib/customer-api";
import {
  getAllSalesDetail,
  getPriceHistory,
  getProducts,
  getSales,
} from "../lib/sales-product-api";

function getTransNo(sale) {
  return sale.transno || sale.transNo;
}

function getSalesDate(sale) {
  return sale.salesdate || sale.salesdate || sale.salesDate || "-";
}

function getCustNo(sale) {
  return sale.custno || sale.custNo;
}

function getEmpNo(sale) {
  return sale.empno || sale.empNo || "-";
}

function getProdCode(item) {
  return item.prodcode || item.prodCode;
}

function getQuantity(item) {
  return Number(item.quantity || 0);
}

function getUnitPrice(price) {
  return Number(price?.unitprice || price?.unitPrice || 0);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function SalesPage() {
  return (
    <DataErrorBoundary>
      <SalesContent />
    </DataErrorBoundary>
  );
}

function SalesContent() {
  const [sales, setSales] = useState([]);
  const [details, setDetails] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadSales() {
      setLoading(true);
      setError(null);
      try {
        const [salesData, detailData, customerData, productData, priceData] =
          await Promise.all([
            getSales(),
            getAllSalesDetail(),
            getCustomers("ADMIN"),
            getProducts(),
            getPriceHistory(),
          ]);

        if (isMounted) {
          setSales(salesData);
          setDetails(detailData);
          setCustomers(customerData);
          setProducts(productData);
          setPrices(priceData);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSales();
    return () => {
      isMounted = false;
    };
  }, []);

  const report = useMemo(() => {
    const customerMap = Object.fromEntries(
      customers.map((customer) => [customer.custno, customer]),
    );
    const productMap = Object.fromEntries(
      products.map((product) => [product.prodcode || product.prodCode, product]),
    );
    const latestPriceMap = prices.reduce((map, price) => {
      const prodCode = getProdCode(price);
      if (!map[prodCode]) map[prodCode] = price;
      return map;
    }, {});

    const detailsByTransaction = details.reduce((map, item) => {
      const transNo = getTransNo(item);
      if (!map[transNo]) map[transNo] = [];
      map[transNo].push(item);
      return map;
    }, {});

    const rows = sales.map((sale) => {
      const transNo = getTransNo(sale);
      const lineItems = detailsByTransaction[transNo] || [];
      const total = lineItems.reduce((sum, item) => {
        const price = latestPriceMap[getProdCode(item)];
        return sum + getQuantity(item) * getUnitPrice(price);
      }, 0);
      const custNo = getCustNo(sale);
      return {
        ...sale,
        transNo,
        custNo,
        customer: customerMap[custNo],
        lineItems,
        total,
      };
    });

    const totalRevenue = rows.reduce((sum, row) => sum + row.total, 0);
    const averageSale = rows.length ? totalRevenue / rows.length : 0;
    const itemCount = details.reduce((sum, item) => sum + getQuantity(item), 0);
    const topCustomers = Object.values(
      rows.reduce((map, row) => {
        const key = row.custNo || "Unknown";
        if (!map[key]) {
          map[key] = {
            custNo: key,
            name: row.customer?.custname || key,
            orders: 0,
            total: 0,
          };
        }
        map[key].orders += 1;
        map[key].total += row.total;
        return map;
      }, {}),
    )
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      rows,
      totalRevenue,
      averageSale,
      itemCount,
      topCustomers,
      productMap,
      latestPriceMap,
    };
  }, [customers, details, prices, products, sales]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return report.rows;

    return report.rows.filter((sale) => {
      return (
        sale.transNo?.toLowerCase().includes(normalizedQuery) ||
        sale.custNo?.toLowerCase().includes(normalizedQuery) ||
        sale.customer?.custname?.toLowerCase().includes(normalizedQuery) ||
        getSalesDate(sale).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, report.rows]);

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const currentPage = clampPage(page, totalPages);
  const pagedRows = getPageItems(filteredRows, currentPage);

  if (loading) return <DataLoadingState label="Loading sales records..." />;
  if (error) return <DataErrorState message={error} />;

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Sales</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review sales transactions, revenue totals, and customer activity.
            </p>
          </div>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search sales"
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Revenue"
            value={formatMoney(report.totalRevenue)}
            note="Latest price history"
          />
          <StatCard label="Transactions" value={sales.length} note="Sales rows" />
          <StatCard
            label="Line quantity"
            value={report.itemCount.toLocaleString()}
            note="Sales detail units"
          />
          <StatCard
            label="Average sale"
            value={formatMoney(report.averageSale)}
            note="Revenue per transaction"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Click a transaction to review its product line items.
            </p>
          </div>

          {filteredRows.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No sales found.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Trans No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Emp No</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                  {pagedRows.map((sale) => (
                    <tr
                      key={sale.transNo}
                      onClick={() => setSelectedSale(sale)}
                      className="cursor-pointer hover:bg-emerald-50/50"
                    >
                      <td className="px-4 py-4 font-medium text-emerald-700">
                        {sale.transNo}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {getSalesDate(sale)}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {sale.customer?.custname || sale.custNo || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {getEmpNo(sale)}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {formatMoney(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={currentPage}
                total={filteredRows.length}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Top customers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ranked by revenue from current product prices.
          </p>
          <div className="mt-6 space-y-3">
            {report.topCustomers.length === 0 ? (
              <p className="text-sm text-slate-600">No customer sales yet.</p>
            ) : (
              report.topCustomers.map((customer) => (
                <div
                  key={customer.custNo}
                  className="rounded-[1.25rem] border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {customer.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {customer.orders} transactions
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(customer.total)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedSale ? (
        <SalesDetailDialog
          sale={selectedSale}
          productMap={report.productMap}
          priceMap={report.latestPriceMap}
          onClose={() => setSelectedSale(null)}
        />
      ) : null}
    </section>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-emerald-700">{note}</p>
    </div>
  );
}

function SalesDetailDialog({ sale, productMap, priceMap, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Transaction {sale.transNo}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {sale.customer?.custname || sale.custNo} · {getSalesDate(sale)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.lineItems.map((item) => {
                const prodCode = getProdCode(item);
                const product = productMap[prodCode];
                const unitPrice = getUnitPrice(priceMap[prodCode]);
                const quantity = getQuantity(item);
                return (
                  <tr key={`${sale.transNo}-${prodCode}`}>
                    <td className="px-4 py-4 text-slate-700">
                      {product?.description || prodCode}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{quantity}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatMoney(unitPrice)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {formatMoney(quantity * unitPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
