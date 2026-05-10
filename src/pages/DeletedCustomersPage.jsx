export function DeletedCustomersPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Deleted Customers
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review archived accounts and restore customers as needed.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Restore selected
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
          <p className="font-semibold">Archived customer accounts</p>
          <p className="mt-1 text-slate-600">
            These customers have been removed from active workflows but can be
            restored.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Removed</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {[
                {
                  name: "Noah Hart",
                  reason: "Inactive",
                  removed: "Mar 21",
                  revenue: "$3.4K",
                },
                {
                  name: "Emma Reed",
                  reason: "Duplicate",
                  removed: "Apr 2",
                  revenue: "$1.1K",
                },
                {
                  name: "Liam Fox",
                  reason: "Canceled",
                  removed: "Apr 11",
                  revenue: "$2.7K",
                },
              ].map((customer) => (
                <tr
                  key={customer.name}
                  className="transition hover:bg-emerald-50/60"
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {customer.reason}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {customer.removed}
                  </td>
                  <td className="px-4 py-4 text-slate-900">
                    {customer.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
