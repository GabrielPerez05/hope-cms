import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTopCustomers } from "../lib/reports-api";
import { DataLoadingState, DataErrorState } from "../components/DataStates";

function formatCurrency(val) {
  return Number(val || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

const MEDAL = ["🥇", "🥈", "🥉"];

export function TopCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopCustomers(10);
        if (!cancelled) setCustomers(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <DataLoadingState label="Loading top customers…" />;
  if (error) return <DataErrorState message={error} />;

  const topSpend = customers[0]?.total_spend || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Top Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Top 10 active customers ranked by total spend (current prices).
        </p>
      </div>

      {/* Summary strip */}
      {customers.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Top spender
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{customers[0].custname}</p>
          <p className="mt-0.5 text-sm text-emerald-700">
            {formatCurrency(customers[0].total_spend)} across{" "}
            {Number(customers[0].transaction_count).toLocaleString()} transaction
            {customers[0].transaction_count !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        {customers.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-400">
            No active customers with sales found.
          </p>
        ) : (
          customers.map((c, idx) => {
            const barWidth = Math.max(4, Math.round((Number(c.total_spend) / Number(topSpend)) * 100));
            const isTop3 = idx < 3;
            return (
              <div
                key={c.custno}
                className={`relative overflow-hidden rounded-2xl border p-4 transition-shadow hover:shadow-md ${
                  isTop3
                    ? "border-emerald-200 bg-white shadow-sm"
                    : "border-emerald-100 bg-white"
                }`}
              >
                {/* Revenue bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-50 transition-all"
                  style={{ width: `${barWidth}%` }}
                />

                <div className="relative flex items-center gap-4">
                  {/* Rank badge */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      isTop3
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {idx < 3 ? MEDAL[idx] : <span className="text-sm">#{idx + 1}</span>}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Link
                        to={`/customers/${c.custno}`}
                        className="truncate font-semibold text-slate-900 hover:text-emerald-700 hover:underline"
                      >
                        {c.custname}
                      </Link>
                      <span className="font-mono text-xs text-slate-400">{c.custno}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {Number(c.transaction_count).toLocaleString()} transaction
                      {c.transaction_count !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Spend */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(c.total_spend)}</p>
                    {c.last_sale_date && (
                      <p className="text-xs text-slate-400">
                        Last:{" "}
                        {new Date(c.last_sale_date).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
