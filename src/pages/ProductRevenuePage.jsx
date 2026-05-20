import { useEffect, useState } from "react";
import { getProductRevenue } from "../lib/reports-api";
import { DataLoadingState, DataErrorState } from "../components/DataStates";
import { Pagination } from "../components/Pagination";
import { getPageItems, clampPage } from "../lib/pagination";

const PAGE_SIZE = 10;

function formatCurrency(val) {
  return Number(val || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function ProductRevenuePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductRevenue();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter(
    (p) =>
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.prodcode?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = clampPage(page, totalPages);
  const pageItems = getPageItems(filtered, currentPage, PAGE_SIZE);

  const totalRevenue = products.reduce((sum, p) => sum + Number(p.total_revenue || 0), 0);
  const withSales = products.filter((p) => Number(p.total_revenue) > 0).length;

  if (loading) return <DataLoadingState label="Loading product revenue…" />;
  if (error) return <DataErrorState message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Product Revenue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Total quantity sold and revenue per product (read-only).
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: "Total Products", value: products.length },
          { label: "Products with Sales", value: withSales },
          { label: "Total Revenue", value: formatCurrency(totalRevenue) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by product code or description…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-100">
        <table className="min-w-full divide-y divide-emerald-100 text-sm">
          <thead className="bg-emerald-50">
            <tr>
              {["#", "Prod Code", "Description", "Unit", "Qty Sold", "Total Revenue"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-emerald-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 bg-white">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No products found.
                </td>
              </tr>
            ) : (
              pageItems.map((prod, idx) => {
                const rank = (currentPage - 1) * PAGE_SIZE + idx + 1;
                const hasRevenue = Number(prod.total_revenue) > 0;
                return (
                  <tr key={prod.prodcode} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-500">{rank}</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-700">{prod.prodcode}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{prod.description}</td>
                    <td className="px-4 py-3 text-slate-500 uppercase">{prod.unit}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {Number(prod.total_quantity || 0).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${hasRevenue ? "text-slate-900" : "text-slate-400"}`}>
                      {hasRevenue ? formatCurrency(prod.total_revenue) : "No sales"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
