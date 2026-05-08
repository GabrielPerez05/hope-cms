type PlaceholderPageProps = {
  title: string
  description: string
}

const moduleData: Record<
  string,
  {
    eyebrow: string
    metrics: Array<{ label: string; value: string; helper: string }>
    columns: string[]
    rows: string[][]
  }
> = {
  Customers: {
    eyebrow: 'Primary CRUD module',
    metrics: [
      { label: 'Seed Customers', value: '82', helper: 'ACTIVE by default' },
      { label: 'Allowed Actions', value: '4', helper: 'View, add, edit, soft remove' },
      { label: 'Audit Field', value: 'Stamp', helper: 'Hidden from USER' },
    ],
    columns: ['custno', 'custname', 'payterm', 'status'],
    rows: [
      ['C0001', 'Acme Trading', '30D', 'ACTIVE'],
      ['C0002', 'North Supply', 'COD', 'ACTIVE'],
      ['C0003', 'River Works', '45D', 'ACTIVE'],
    ],
  },
  Sales: {
    eyebrow: 'Read-only transaction module',
    metrics: [
      { label: 'Seed Sales', value: '124', helper: 'Customer-linked transactions' },
      { label: 'Mutation Buttons', value: '0', helper: 'View-only for all roles' },
      { label: 'Detail Drill-down', value: 'Ready', helper: 'Sprint 2 wiring' },
    ],
    columns: ['transNo', 'salesDate', 'custNo', 'empNo'],
    rows: [
      ['TR000001', '2026-01-04', 'C0001', 'E0002'],
      ['TR000002', '2026-01-06', 'C0002', 'E0004'],
      ['TR000003', '2026-01-11', 'C0003', 'E0001'],
    ],
  },
  Products: {
    eyebrow: 'Read-only catalogue module',
    metrics: [
      { label: 'Products', value: '52', helper: 'Seed catalogue' },
      { label: 'Price Source', value: 'Latest', helper: 'MAX effective date' },
      { label: 'Mutation Buttons', value: '0', helper: 'RLS SELECT only' },
    ],
    columns: ['prodCode', 'description', 'unit', 'currentPrice'],
    rows: [
      ['AK0001', 'Angle Kit', 'pc', '125.00'],
      ['BL0007', 'Bolt Lock', 'pkg', '410.00'],
      ['PR0012', 'Primer', 'ltr', '285.00'],
    ],
  },
  Admin: {
    eyebrow: 'Account activation module',
    metrics: [
      { label: 'Default Role', value: 'USER', helper: 'Auto-provisioned' },
      { label: 'Default Status', value: 'INACTIVE', helper: 'Pending approval' },
      { label: 'Protected Role', value: 'SA', helper: 'SUPERADMIN locked' },
    ],
    columns: ['username', 'user_type', 'status', 'action'],
    rows: [
      ['jcesperanza', 'SUPERADMIN', 'ACTIVE', 'Locked'],
      ['sales.manager', 'ADMIN', 'ACTIVE', 'Manage'],
      ['staff.pending', 'USER', 'INACTIVE', 'Activate'],
    ],
  },
  'Deleted Customers': {
    eyebrow: 'Soft-removal recovery module',
    metrics: [
      { label: 'Hard Removal', value: 'Never', helper: 'Status update only' },
      { label: 'USER Visibility', value: '0', helper: 'Inactive rows hidden' },
      { label: 'Recovery', value: 'Admin+', helper: 'ACTIVE restore' },
    ],
    columns: ['custno', 'custname', 'status', 'recovery'],
    rows: [
      ['C0017', 'Metro Parts', 'INACTIVE', 'Available'],
      ['C0029', 'Southline Co.', 'INACTIVE', 'Available'],
      ['C0044', 'Bright Depot', 'INACTIVE', 'Available'],
    ],
  },
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const data = moduleData[title] || moduleData.Customers

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              {data.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
            Sprint 1 scaffold
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-600">{metric.helper}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Preview table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {data.columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((row) => (
                <tr key={row.join('-')} className="hover:bg-slate-50">
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
