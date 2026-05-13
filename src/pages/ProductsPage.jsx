<<<<<<< HEAD
export function ProductsPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage your catalog, inventory, and product availability in one
              place.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Add product
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Total items", value: "214" },
            { label: "In stock", value: "187" },
            { label: "Low stock", value: "12" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.75rem] bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Inventory snapshot
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              See a quick overview of your most important products.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
            View all products
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { name: "Emerald Desk Lamp", stock: "38", price: "$42" },
            { name: "Hope Planner", stock: "12", price: "$24" },
            { name: "Field Journal", stock: "54", price: "$18" },
            { name: "Growth Kit", stock: "3", price: "$120" },
          ].map((product) => (
            <div
              key={product.name}
              className="rounded-[1.75rem] border border-slate-100 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {product.stock} in stock
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  {product.price}
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
export function ProductsPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage your catalog, inventory, and product availability in one
              place.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Add product
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Total items", value: "214" },
            { label: "In stock", value: "187" },
            { label: "Low stock", value: "12" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.75rem] bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Inventory snapshot
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              See a quick overview of your most important products.
            </p>
          </div>
          <button className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
            View all products
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { name: "Emerald Desk Lamp", stock: "38", price: "$42" },
            { name: "Hope Planner", stock: "12", price: "$24" },
            { name: "Field Journal", stock: "54", price: "$18" },
            { name: "Growth Kit", stock: "3", price: "$120" },
          ].map((product) => (
            <div
              key={product.name}
              className="rounded-[1.75rem] border border-slate-100 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {product.stock} in stock
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  {product.price}
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
