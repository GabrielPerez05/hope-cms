export function CustomersPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Customers</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              View customer accounts, recent activity, and quick actions for
              your sales team.
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Add customer
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active customers</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">1,241</p>
            <p className="mt-2 text-sm text-emerald-700">+12% this month</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">New accounts</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">86</p>
            <p className="mt-2 text-sm text-emerald-700">
              4-day activation rate
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Support requests</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">14</p>
            <p className="mt-2 text-sm text-emerald-700">2 urgent tickets</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Recent visitors
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track the latest customer interactions and their account health.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
            Export list
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-emerald-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {[
                {
                  name: "Ariana Graves",
                  status: "Active",
                  company: "Evergreen Co.",
                  lastActive: "2h ago",
                  revenue: "$9.8K",
                },
                {
                  name: "Jules Parker",
                  status: "At risk",
                  company: "Cedar Labs",
                  lastActive: "5h ago",
                  revenue: "$4.2K",
                },
                {
                  name: "Mia Thompson",
                  status: "Active",
                  company: "Hope Retail",
                  lastActive: "Yesterday",
                  revenue: "$3.1K",
                },
                {
                  name: "Theo Brooks",
                  status: "Onboarding",
                  company: "Willow Works",
                  lastActive: "2 days ago",
                  revenue: "$1.6K",
                },
              ].map((customer) => (
                <tr
                  key={customer.name}
                  className="transition hover:bg-emerald-50/50"
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        customer.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : customer.status === "At risk"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {customer.company}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {customer.lastActive}
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
