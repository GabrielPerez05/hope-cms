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
import { getCustomers } from "../lib/customer-api";

function getStamp(customer) {
  return (
    customer.updated_at ||
    customer.created_at ||
    customer.stamp ||
    customer.date_updated ||
    "-"
  );
}

export function DeletedCustomersPage() {
  return (
    <DataErrorBoundary>
      <DeletedCustomersContent />
    </DataErrorBoundary>
  );
}

function DeletedCustomersContent() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

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
                      {getStamp(customer)}
                    </td>
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
    </section>
  );
}
