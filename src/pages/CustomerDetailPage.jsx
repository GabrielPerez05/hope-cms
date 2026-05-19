import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRights } from "../hooks/useRights";
import {
  DataErrorBoundary,
  DataErrorState,
  DataLoadingState,
} from "../components/DataStates";
import { getCustomers } from "../lib/customer-api";
import {
  getCurrentPrice,
  getProducts,
  getSalesByCustomer,
  getSalesDetail,
} from "../lib/sales-product-api";

function getTransNo(sale) {
  return sale.transno || sale.transNo;
}

function getSalesDate(sale) {
  return sale.salesdate || sale.salesdate || sale.salesDate || "-";
}

function getEmpNo(sale) {
  return sale.empno || sale.empNo || "-";
}

function getProdCode(item) {
  return item.prodcode || item.prodCode;
}

function getUnitPrice(price) {
  return price?.unitprice || price?.unitPrice || 0;
}

function SalesDetailModal({ transaction, items, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Sales detail
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Transaction {transaction}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={`${transaction}-${getProdCode(item)}`}>
                  <td className="px-4 py-4 text-slate-700">
                    {item.description || item.product?.description || getProdCode(item)}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    ${getUnitPrice(item.currentPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailContent() {
  const { custNo } = useParams();
  const { hasRight } = useRights();
  const canViewDetail = hasRight("SD_VIEW");
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTransNo, setSelectedTransNo] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const [customersData, salesData, productsData] = await Promise.all([
          getCustomers("ADMIN"),
          getSalesByCustomer(custNo),
          getProducts(),
        ]);

        if (isMounted) {
          setCustomer(
            customersData.find((item) => item.custno === custNo) || null,
          );
          setSales(salesData);
          setProducts(productsData);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [custNo]);

  const productMap = useMemo(() => {
    return products.reduce((map, product) => {
      map[product.prodcode || product.prodCode] = product;
      return map;
    }, {});
  }, [products]);

  async function openTransaction(transNo) {
    setDetailLoading(true);
    setSelectedTransNo(transNo);
    try {
      const details = await getSalesDetail(transNo);
      const enriched = await Promise.all(
        details.map(async (item) => {
          const prodCode = getProdCode(item);
          const product = productMap[prodCode] || item.product || {};
          const currentPrice = await getCurrentPrice(prodCode);
          return {
            ...item,
            description: product.description,
            currentPrice,
          };
        }),
      );
      setLineItems(enriched);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) return <DataLoadingState label="Loading customer profile..." />;
  if (error) return <DataErrorState message={error} />;
  if (!customer) return <DataErrorState message="Customer was not found." />;

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-700 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to customers
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {customer.custname}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              {customer.address}
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 text-sm shadow-sm">
            <p className="text-slate-500">Customer No</p>
            <p className="mt-1 font-semibold text-slate-900">
              {customer.custno}
            </p>
            <p className="mt-4 text-slate-500">Pay Term</p>
            <p className="mt-1 font-semibold text-slate-900">
              {customer.payterm}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Sales Summary</h2>
        <p className="mt-1 text-sm text-slate-500">Quick metrics for this customer.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">Transactions</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{sales.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">Most Recent Sale</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {sales.length > 0
                ? new Date(
                    Math.max(...sales.map((s) => new Date(getSalesDate(s)).getTime()))
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">First Sale</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {sales.length > 0
                ? new Date(
                    Math.min(...sales.map((s) => new Date(getSalesDate(s)).getTime()))
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Sales history</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Trans No</th>
                <th className="px-4 py-3">Sales Date</th>
                <th className="px-4 py-3">Emp No</th>
                {canViewDetail ? <th className="w-10 px-4 py-3"></th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <tr
                  key={getTransNo(sale)}
                  onClick={canViewDetail ? () => openTransaction(getTransNo(sale)) : undefined}
                  className={canViewDetail ? "cursor-pointer transition hover:bg-emerald-50 hover:shadow-[inset_3px_0_0_0] hover:shadow-emerald-400" : ""}
                >
                  <td className="px-4 py-4 font-medium text-emerald-700">
                    {getTransNo(sale)}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {getSalesDate(sale)}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {getEmpNo(sale)}
                  </td>
                  {canViewDetail ? (
                    <td className="w-10 px-4 py-4 text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransNo ? (
        <SalesDetailModal
          transaction={selectedTransNo}
          items={detailLoading ? [] : lineItems}
          onClose={() => setSelectedTransNo(null)}
        />
      ) : null}
    </section>
  );
}

export function CustomerDetailPage() {
  return (
    <DataErrorBoundary>
      <CustomerDetailContent />
    </DataErrorBoundary>
  );
}
