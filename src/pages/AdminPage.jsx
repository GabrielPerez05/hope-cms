<<<<<<< HEAD
export function AdminPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage user access, system settings, and administrative workflows.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Create role
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active users</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">34</p>
            <p className="mt-2 text-sm text-emerald-700">7 new this week</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Roles assigned</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">5</p>
            <p className="mt-2 text-sm text-emerald-700">Setup complete</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending approvals</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">2</p>
            <p className="mt-2 text-sm text-emerald-700">Review required</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Team access
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review roles and permissions for the current team.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
            Audit logs
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { name: "Jordan Lee", role: "Admin", status: "Active" },
            { name: "Isla Chen", role: "Manager", status: "Active" },
            { name: "Mateo Cruz", role: "Support", status: "Pending" },
            { name: "Ava Green", role: "Sales", status: "Active" },
          ].map((member) => (
            <div
              key={member.name}
              className="rounded-3xl border border-slate-100 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    member.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
=======
export function AdminPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage user access, system settings, and administrative workflows.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Create role
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active users</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">34</p>
            <p className="mt-2 text-sm text-emerald-700">7 new this week</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Roles assigned</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">5</p>
            <p className="mt-2 text-sm text-emerald-700">Setup complete</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending approvals</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">2</p>
            <p className="mt-2 text-sm text-emerald-700">Review required</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Team access
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review roles and permissions for the current team.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
            Audit logs
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { name: "Jordan Lee", role: "Admin", status: "Active" },
            { name: "Isla Chen", role: "Manager", status: "Active" },
            { name: "Mateo Cruz", role: "Support", status: "Pending" },
            { name: "Ava Green", role: "Sales", status: "Active" },
          ].map((member) => (
            <div
              key={member.name}
              className="rounded-3xl border border-slate-100 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    member.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
>>>>>>> 535af6926ae60f228da74f82990a30ff8a584b19
