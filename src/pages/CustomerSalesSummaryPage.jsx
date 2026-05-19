import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerSalesSummary } from "../lib/reports-api";
import { useRights } from "../hooks/useRights";
import { DataLoadingState, DataErrorState } from "../components/DataStates";
import { Pagination } from "../components/Pagination";
import { getPageItems, clampPage } from "../lib/pagination";

const PAGE_SIZE = 10;

function formatCurrency(val) {
  return Number(val || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerSalesSummaryPage() {
  const { userType } = useRights();
  const isAdmin = userType === "ADMIN" || userType === "SUPERADMIN";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCustomerSalesSummary()
      .then((data) => {
        const filtered = isAdmin ? data : data.filter((r) => r.record_status === "ACTIVE");
        setRows(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const filtered = rows.filter((r) =>
    r.custname?.toLowerCase().includes(search.toLowerCase()) ||
    r.custno?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = clampPage(page, totalPages);
  const pageItems = getPageItems(filtered, currentPage, PAGE_SIZE);

  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.total_spend || 0), 0);
  const totalTx = rows.reduce((sum, r) => sum + Number(r.transaction_count || 0), 0);
  const activeCount = rows.filter((r) => r.record_status === "ACTIVE").length;

  if (loading) return <DataLoadingState label="Loading customer sales summary…" />;
  if (error) return <DataErrorState message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Sales Summary</h1>
        <p className="mt-1 text-sm text-slate-500">
          Total transactions and spend per customer, ranked by revenue.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Customers", value: rows.length },
          { label: "Active Customers", value: activeCount },
          { label: "Total Transactions", value: totalTx.toLocaleString() },
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
        placeholder="Search by customer name or number…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-100">
        <table className="min-w-full divide-y divide-emerald-100 text-sm">
          <thead className="bg-emerald-50">
            <tr>
              {["#", "Cust No", "Name", "Status", "Transactions", "Total Spend", "Last Sale"].map((h) => (
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
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            ) : (
              pageItems.map((row, idx) => {
                const rank = (currentPage - 1) * PAGE_SIZE + idx + 1;
                return (
                  <tr key={row.custno} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-500">{rank}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/customers/${row.custno}`}
                        className="font-mono text-emerald-700 hover:underline"
                      >
                        {row.custno}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.custname}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.record_status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {row.record_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{Number(row.transaction_count).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(row.total_spend)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(row.last_sale_date)}</td>
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
