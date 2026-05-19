import { useEffect, useState } from "react";
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
import { useRights } from "../contexts/user-rights-context";
import { getCustomers, recoverCustomer } from "../lib/customer-api";
import { useToast, ToastContainer } from "../components/Toast";

function formatStamp(customer) {
  const raw = customer.stamp || customer.updated_at || customer.created_at || customer.date_updated;
  if (!raw) return "-";

  const colonIdx = raw.indexOf(":");
  const possibleAction = colonIdx > 0 ? raw.slice(0, colonIdx) : "";

  if (/^[A-Z]+$/.test(possibleAction)) {
    const dateStr = raw.slice(colonIdx + 1);
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const label = possibleAction.charAt(0) + possibleAction.slice(1).toLowerCase();
      const formatted = date.toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      });
      return `${label} · ${formatted}`;
    }
  }

  const date = new Date(raw);
  if (!isNaN(date.getTime())) {
    return date.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  }

  return raw;
}

export function DeletedCustomersPage() {
  return (
    <DataErrorBoundary>
      <DeletedCustomersContent />
    </DataErrorBoundary>
  );
}

function DeletedCustomersContent() {
  const { userType } = useRights();
  const { toasts, success: toastSuccess, error: toastError } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const canRecover = userType === "ADMIN" || userType === "SUPERADMIN";

  useEffect(() => {
    let isMounted = true;

    async function loadCustomers() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomers("ADMIN");
        if (isMounted) {
          setCustomers(
            data.filter((customer) => customer.record_status === "INACTIVE"),
          );
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCustomers();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <DataLoadingState label="Loading deleted customers..." />;
  if (error) return <DataErrorState message={error} />;

  const totalPages = Math.ceil(customers.length / PAGE_SIZE);
  const currentPage = clampPage(page, totalPages);
  const pagedCustomers = getPageItems(customers, currentPage);

  async function handleRecover(custNo) {
    setError(null);
    try {
      await recoverCustomer(custNo);
      setCustomers((items) => items.filter((customer) => customer.custno !== custNo));
      toastSuccess("Customer recovered.");
    } catch (err) {
      toastError(err.message);
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Deleted Customers
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Customers that have been soft deleted from active workflows.
        </p>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        {customers.length === 0 ? (
          <p className="text-sm text-slate-600">No deleted customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cust No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Pay Term</th>
                  <th className="px-4 py-3">Updated</th>
                  {canRecover ? <th className="px-4 py-3">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                {pagedCustomers.map((customer) => (
                  <tr key={customer.custno} className="hover:bg-emerald-50/50">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {customer.custno}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {customer.custname}
                    </td>
                    <td className="max-w-sm px-4 py-4 text-slate-600">
                      {customer.address}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {customer.payterm}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatStamp(customer)}
                    </td>
                    {canRecover ? (
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleRecover(customer.custno)}
                          className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                        >
                          Recover
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={currentPage}
              total={customers.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} />
    </section>
  );
}
