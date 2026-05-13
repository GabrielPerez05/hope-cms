export function SalesPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Sales</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor revenue growth, order performance, and pipeline health.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            New sale
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Revenue", value: "$82.4K", note: "+14%" },
            { label: "Orders", value: "142", note: "+21%" },
            { label: "Conversion", value: "9.8%", note: "+1.2 pts" },
            { label: "Average sale", value: "$580", note: "Stable" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.75rem] bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-emerald-700">{stat.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Sales trends
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Weekly revenue and conversions at a glance.
              </p>
            </div>
            <button className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
              View report
            </button>
          </div>

          <div className="mt-6 h-[300px] rounded-[1.75rem] bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 text-slate-500">
            <div className="h-full rounded-[1.5rem] border border-emerald-100 bg-white p-6 shadow-inner">
              <p className="text-sm">Chart placeholder</p>
              <div className="mt-6 h-full rounded-2xl bg-emerald-100/40" />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Top deals</h2>
            <p className="mt-1 text-sm text-slate-500">
              High-value opportunities currently in progress.
            </p>
          </div>
          {[
            {
              title: "Hope Retail Renewal",
              stage: "Negotiation",
              value: "$12.4K",
            },
            {
              title: "Cedar Labs Expansion",
              stage: "Proposal",
              value: "$8.9K",
            },
            {
              title: "Evergreen Co. onboarding",
              stage: "Closing",
              value: "$6.2K",
            },
          ].map((deal) => (
            <div
              key={deal.title}
              className="rounded-3xl border border-slate-100 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{deal.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{deal.stage}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {deal.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
