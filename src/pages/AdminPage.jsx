import { useEffect, useMemo, useState } from "react";
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
import {
  MODULES,
  RIGHTS,
  getAdminUsers,
  updateAdminUser,
  updateUserModule,
  updateUserRight,
} from "../lib/admin-api";

const USER_TYPES = ["USER", "ADMIN", "SUPERADMIN"];
const STATUSES = ["ACTIVE", "INACTIVE"];

export function AdminPage() {
  return (
    <DataErrorBoundary>
      <AdminContent />
    </DataErrorBoundary>
  );
}

function AdminContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getAdminUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.record_status === "ACTIVE");
    const admins = users.filter((user) =>
      ["ADMIN", "SUPERADMIN"].includes(user.user_type),
    );
    const pending = users.filter((user) => user.record_status !== "ACTIVE");
    return {
      users: users.length,
      active: activeUsers.length,
      admins: admins.length,
      pending: pending.length,
    };
  }, [users]);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const currentPage = clampPage(page, totalPages);
  const pagedUsers = getPageItems(users, currentPage);

  async function saveUser(userId, updates) {
    setSaving(userId);
    setError(null);
    try {
      const updated = await updateAdminUser(userId, updates);
      setUsers((items) =>
        items.map((item) => (item.userId === userId ? { ...item, ...updated } : item)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  async function toggleModule(userId, moduleName, value) {
    setSaving(`${userId}-${moduleName}`);
    setError(null);
    try {
      await updateUserModule(userId, moduleName, value);
      setUsers((items) =>
        items.map((item) =>
          item.userId === userId
            ? { ...item, modules: { ...item.modules, [moduleName]: value } }
            : item,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  async function toggleRight(userId, rightName, value) {
    setSaving(`${userId}-${rightName}`);
    setError(null);
    try {
      await updateUserRight(userId, rightName, value);
      setUsers((items) =>
        items.map((item) =>
          item.userId === userId
            ? { ...item, rights: { ...item.rights, [rightName]: value } }
            : item,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  if (loading) return <DataLoadingState label="Loading user access..." />;

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage application users, module access, and permission flags.
            </p>
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Refresh users
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total users" value={stats.users} note="App profiles" />
          <StatCard label="Active users" value={stats.active} note="Can sign in" />
          <StatCard label="Admins" value={stats.admins} note="Admin or superadmin" />
          <StatCard label="Pending" value={stats.pending} note="Inactive accounts" />
        </div>
      </div>

      {error ? <DataErrorState message={error} /> : null}

      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Team access</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update user type, account status, module access, and rights.
          </p>
        </div>

        {users.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">
            No app users found. Run `rights_seed.sql` and the provisioning trigger
            migration in Supabase, then refresh this page.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {pagedUsers.map((user) => (
              <UserAccessPanel
                key={user.userId}
                user={user}
                saving={saving}
                onSaveUser={saveUser}
                onToggleModule={toggleModule}
                onToggleRight={toggleRight}
              />
            ))}
            <Pagination
              page={currentPage}
              total={users.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-emerald-700">{note}</p>
    </div>
  );
}

function UserAccessPanel({
  user,
  saving,
  onSaveUser,
  onToggleModule,
  onToggleRight,
}) {
  const isSuperAdmin = user.user_type === "SUPERADMIN";
  const disabled = Boolean(saving) || isSuperAdmin;

  return (
    <div
      className={`rounded-[1.5rem] border p-4 ${isSuperAdmin ? "border-amber-200 bg-amber-50/50" : "border-slate-100"}`}
      title={isSuperAdmin ? "SUPERADMIN accounts cannot be modified" : undefined}
    >
      <div className="grid gap-4 xl:grid-cols-[1.4fr_180px_180px] xl:items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">
              {user.username || user.email}
            </p>
            {isSuperAdmin && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Protected
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          {isSuperAdmin && (
            <p className="mt-1 text-xs text-amber-700">
              SUPERADMIN accounts cannot be modified
            </p>
          )}
        </div>
        <select
          value={user.user_type}
          disabled={disabled}
          onChange={(event) =>
            onSaveUser(user.userId, { user_type: event.target.value })
          }
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {USER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={user.record_status}
          disabled={disabled}
          onChange={(event) =>
            onSaveUser(user.userId, { record_status: event.target.value })
          }
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <AccessGroup title="Modules">
          {MODULES.map((moduleName) => (
            <Toggle
              key={moduleName}
              label={moduleName}
              checked={Boolean(user.modules?.[moduleName])}
              disabled={disabled}
              onChange={(value) => onToggleModule(user.userId, moduleName, value)}
            />
          ))}
        </AccessGroup>
        <AccessGroup title="Rights">
          {RIGHTS.map((rightName) => (
            <Toggle
              key={rightName}
              label={rightName}
              checked={Boolean(user.rights?.[rightName])}
              disabled={disabled}
              onChange={(value) => onToggleRight(user.userId, rightName, value)}
            />
          ))}
        </AccessGroup>
      </div>
    </div>
  );
}

function AccessGroup({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Toggle({ label, checked, disabled, onChange }) {
  return (
    <label className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${disabled ? "cursor-not-allowed border-slate-100 text-slate-400" : "border-slate-200 text-slate-700"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-emerald-700 disabled:cursor-not-allowed"
      />
      {label}
    </label>
  );
}
