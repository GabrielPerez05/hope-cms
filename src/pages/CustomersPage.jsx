import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DataErrorBoundary,
  DataErrorState,
  DataLoadingState,
} from "../components/DataStates";
import {
  Pagination,
} from "../components/Pagination";
import {
  clampPage,
  getPageItems,
} from "../lib/pagination";
import { useAuth } from "../hooks/useAuth";
import { useRights } from "../contexts/user-rights-context";
import {
  addCustomer,
  getCustomers,
  softDeleteCustomer,
  updateCustomer,
} from "../lib/customer-api";

const PAY_TERMS = ["COD", "30D", "45D"];

function getStatus(customer) {
  return customer.record_status || "ACTIVE";
}

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

function CustomerFormModal({ mode, customer, onClose, onSubmit }) {
  const [form, setForm] = useState({
    custno: customer?.custno || "",
    custname: customer?.custname || "",
    address: customer?.address || "",
    payterm: customer?.payterm || "COD",
  });
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.custno.trim() || !form.custname.trim() || !form.address.trim()) {
      setError("Customer number, name, and address are required.");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {mode === "add" ? "Add customer" : "Edit customer"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Maintain customer account details.
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

        {error ? (
          <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Customer No
            <input
              value={form.custno}
              onChange={(event) => updateField("custno", event.target.value)}
              disabled={mode === "edit"}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Name
            <input
              value={form.custname}
              onChange={(event) => updateField("custname", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Address
            <textarea
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Pay Term
            <select
              value={form.payterm}
              onChange={(event) => updateField("payterm", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-emerald-500"
            >
              {PAY_TERMS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            {mode === "add" ? "Add customer" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-emerald-700">{note}</p>
    </div>
  );
}

function SoftDeleteConfirmDialog({ customer, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-900">Are you sure?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Soft delete {customer.custname}? This moves the customer out of active
          workflows.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(customer.custno)}
            className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Soft delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomersPage() {
  return (
    <DataErrorBoundary>
      <CustomersContent />
    </DataErrorBoundary>
  );
}

function CustomersContent() {
  const { currentUser } = useAuth();
  const { hasRight, userType } = useRights();
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [payTerm, setPayTerm] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const isAdminUser = userType === "ADMIN" || userType === "SUPERADMIN";
  const canAdd = isAdminUser || hasRight("CUST_ADD");
  const canEdit = isAdminUser || hasRight("CUST_EDIT");
  const canSoftDelete = userType === "SUPERADMIN" && hasRight("CUST_DEL");
  const showActionsColumn = canEdit || canSoftDelete;
  const showStamp = userType === "ADMIN" || userType === "SUPERADMIN";

  useEffect(() => {
    let isMounted = true;

    async function loadCustomers() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomers(currentUser?.user_type || "USER");
        if (isMounted) setCustomers(data);
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
  }, [currentUser?.user_type]);

  const stats = useMemo(() => {
    const active = customers.filter((c) => getStatus(c) === "ACTIVE").length;
    const inactive = customers.filter((c) => getStatus(c) === "INACTIVE").length;
    const payTermCounts = customers.reduce((acc, c) => {
      const term = c.payterm || "N/A";
      acc[term] = (acc[term] || 0) + 1;
      return acc;
    }, {});
    const topEntry = Object.entries(payTermCounts).sort((a, b) => b[1] - a[1])[0];
    return { total: customers.length, active, inactive, topPayTerm: topEntry ? topEntry[0] : "-" };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const statusVisible =
        userType === "USER" ? getStatus(customer) === "ACTIVE" : true;
      const queryVisible =
        !query.trim() ||
        customer.custname?.toLowerCase().includes(query.toLowerCase()) ||
        customer.payterm?.toLowerCase().includes(query.toLowerCase());
      const payTermVisible = payTerm === "ALL" || customer.payterm === payTerm;
      return statusVisible && queryVisible && payTermVisible;
    });
  }, [customers, payTerm, query, userType]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const currentPage = clampPage(page, totalPages);
  const pagedCustomers = getPageItems(filteredCustomers, currentPage, pageSize);

  async function handleAddCustomer(payload) {
    const created = await addCustomer(payload);
    setCustomers((items) => [created || payload, ...items]);
    setModal(null);
  }

  async function handleEditCustomer(payload) {
    const updated = await updateCustomer(payload.custno, {
      custname: payload.custname,
      address: payload.address,
      payterm: payload.payterm,
    });
    setCustomers((items) =>
      items.map((item) =>
        item.custno === payload.custno ? { ...item, ...(updated || payload) } : item,
      ),
    );
    setModal(null);
  }

  async function handleSoftDelete(custNo) {
    try {
      await softDeleteCustomer(custNo);
      setCustomers((items) =>
        items.map((item) =>
          item.custno === custNo ? { ...item, record_status: "INACTIVE" } : item,
        ),
      );
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <DataLoadingState label="Loading customers..." />;
  if (error) return <DataErrorState message={error} />;

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Customers</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Search, review, and maintain customer account records.
            </p>
          </div>
          {canAdd ? (
            <button
              type="button"
              onClick={() => setModal({ type: "add" })}
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Add customer
            </button>
          ) : null}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px]">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or pay term"
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
          <select
            value={payTerm}
            onChange={(event) => {
              setPayTerm(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="ALL">All pay terms</option>
            {PAY_TERMS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total customers" value={stats.total} note="All visible accounts" />
          <StatCard label="Active" value={stats.active} note="In active workflows" />
          <StatCard label="Inactive" value={stats.inactive} note="Soft-deleted" />
          <StatCard label="Top pay term" value={stats.topPayTerm} note="Most used" />
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Cust No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Pay Term</th>
                <th className="px-4 py-3">Status</th>
                {showStamp ? <th className="px-4 py-3">Stamp</th> : null}
                {showActionsColumn ? (
                  <th className="px-4 py-3">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {pagedCustomers.map((customer) => (
                <tr key={customer.custno} className="hover:bg-emerald-50/50">
                  <td className="px-4 py-4 font-medium text-slate-900">
                    <Link
                      to={`/customers/${customer.custno}`}
                      className="text-emerald-700 underline-offset-4 hover:underline"
                    >
                      {customer.custno}
                    </Link>
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
                    {getStatus(customer)}
                  </td>
                  {showStamp ? (
                    <td className="px-4 py-4 text-slate-600">
                      {formatStamp(customer)}
                    </td>
                  ) : null}
                  {showActionsColumn ? (
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => setModal({ type: "edit", customer })}
                            className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                        ) : null}
                        {canSoftDelete && getStatus(customer) === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setModal({ type: "delete", customer })
                            }
                            className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={filteredCustomers.length}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        />
      </div>

      {modal?.type === "add" ? (
        <CustomerFormModal
          mode="add"
          onClose={() => setModal(null)}
          onSubmit={handleAddCustomer}
        />
      ) : null}
      {modal?.type === "edit" ? (
        <CustomerFormModal
          mode="edit"
          customer={modal.customer}
          onClose={() => setModal(null)}
          onSubmit={handleEditCustomer}
        />
      ) : null}
      {modal?.type === "delete" ? (
        <SoftDeleteConfirmDialog
          customer={modal.customer}
          onCancel={() => setModal(null)}
          onConfirm={handleSoftDelete}
        />
      ) : null}
    </section>
  );
}
