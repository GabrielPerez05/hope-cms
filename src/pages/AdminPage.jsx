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
  clampPage,
  getPageItems,
} from "../lib/pagination";
import {
  getAdminUsers,
  updateAdminUser,
  updateUserRight,
  activateUser,
  deactivateUser,
  DISPLAY_RIGHTS,
  ROLE_DEFAULT_RIGHTS,
} from "../lib/admin-api";
import { useRights } from "../hooks/useRights";
import { useAuth } from "../hooks/useAuth";

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
  const { userType } = useRights();
  const { currentUser } = useAuth();
  const canEdit = userType === "ADMIN" || userType === "SUPERADMIN";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const ADMIN_PAGE_SIZE = 5;

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

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q ||
          user.email?.toLowerCase().includes(q) ||
          user.username?.toLowerCase().includes(q);
        const matchesType = filterType === "ALL" || user.user_type === filterType;
        const matchesStatus = filterStatus === "ALL" || user.record_status === filterStatus;
        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        const nameA = (a.username || a.email || "").toLowerCase();
        const nameB = (b.username || b.email || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [users, query, filterType, filterStatus]);

  const totalPages = Math.ceil(filteredUsers.length / ADMIN_PAGE_SIZE);
  const currentPage = clampPage(page, totalPages);
  const pagedUsers = getPageItems(filteredUsers, currentPage, ADMIN_PAGE_SIZE);

  async function saveUser(userId, updates) {
    setSaving(userId);
    setError(null);
    try {
      const updated = await updateAdminUser(userId, updates);
      setUsers((items) =>
        items.map((item) => {
          if (item.userId !== userId) return item;
          const roleDefaults = updates.user_type ? ROLE_DEFAULT_RIGHTS[updates.user_type] : null;
          const newRights = roleDefaults
            ? Object.fromEntries(Object.entries(roleDefaults).map(([k, v]) => [k, Boolean(v)]))
            : item.rights;
          return { ...item, ...updated, rights: newRights };
        }),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  async function handleActivate(userId) {
    setSaving(userId);
    setError(null);
    try {
      await activateUser(userId);
      setUsers((items) =>
        items.map((item) =>
          item.userId === userId ? { ...item, record_status: "ACTIVE" } : item,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  async function handleDeactivate(userId) {
    setSaving(userId);
    setError(null);
    try {
      await deactivateUser(userId);
      setUsers((items) =>
        items.map((item) =>
          item.userId === userId ? { ...item, record_status: "INACTIVE" } : item,
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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by email or username"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 pr-9 text-sm outline-none focus:border-emerald-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            <option value="ALL">All types</option>
            {USER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            <option value="ALL">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(query || filterType !== "ALL" || filterStatus !== "ALL") && (
            <button
              type="button"
              onClick={() => { setQuery(""); setFilterType("ALL"); setFilterStatus("ALL"); setPage(1); }}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {users.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">
            No app users found. Run `rights_seed.sql` and the provisioning trigger
            migration in Supabase, then refresh this page.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-slate-600">No users match your filters.</p>
            ) : null}
            {pagedUsers.map((user) => (
              <UserAccessPanel
                key={user.userId}
                user={user}
                saving={saving}
                canEdit={canEdit}
                viewerType={userType}
                viewerId={currentUser?.id}
                onSaveUser={saveUser}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onToggleRight={toggleRight}
              />
            ))}
            <Pagination
              page={currentPage}
              pageSize={ADMIN_PAGE_SIZE}
              total={filteredUsers.length}
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

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

function OnlineDot({ lastSeen }) {
  const online = isOnline(lastSeen);
  return (
    <span
      title={online ? "Online" : lastSeen ? `Last seen ${new Date(lastSeen).toLocaleTimeString()}` : "Never seen"}
      className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${online ? "bg-emerald-500" : "bg-slate-300"}`}
    />
  );
}

function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

function UserAccessPanel({
  user,
  saving,
  canEdit,
  viewerType,
  viewerId,
  onSaveUser,
  onActivate,
  onDeactivate,
  onToggleRight,
}) {
  const isSuperAdmin = user.user_type === "SUPERADMIN";
  const isSelf = user.userId === viewerId;
  const disabled = Boolean(saving) || isSuperAdmin || isSelf;
  const availableTypes = viewerType === "SUPERADMIN"
    ? USER_TYPES
    : Array.from(new Set([user.user_type, ...USER_TYPES.filter((t) => t !== "SUPERADMIN")]));

  if (!canEdit) {
    return (
      <div className="rounded-[1.5rem] border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">{user.username || user.email}</p>
              <OnlineDot lastSeen={user.last_seen} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <span className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600">
            {user.user_type}
          </span>
          <span className={`rounded-2xl px-4 py-2 text-sm font-medium ${user.record_status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {user.record_status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[1.5rem] border p-4 ${isSuperAdmin ? "border-amber-200 bg-amber-50/50" : isSelf ? "border-slate-200 bg-slate-50/50" : "border-slate-100"}`}
      title={isSuperAdmin ? "SUPERADMIN accounts cannot be modified" : isSelf ? "You cannot modify your own account" : undefined}
    >
      <div className={`grid gap-4 xl:items-center ${viewerType === "SUPERADMIN" ? "xl:grid-cols-[1.4fr_180px_180px]" : "xl:grid-cols-[1.4fr_180px]"}`}>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">
              {user.username || user.email}
            </p>
            <OnlineDot lastSeen={user.last_seen} />
            {isSuperAdmin && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Protected
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          <p className="mt-1 text-xs text-slate-400">{user.user_type}</p>
          {isSuperAdmin && (
            <p className="mt-1 text-xs text-amber-700">
              SUPERADMIN accounts cannot be modified
            </p>
          )}
        </div>
        {viewerType === "SUPERADMIN" && (
          <select
            value={user.user_type}
            disabled={disabled}
            onChange={(event) =>
              onSaveUser(user.userId, { user_type: event.target.value })
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {availableTypes.map((type) => (
              <option
                key={type}
                value={type}
                disabled={type === "SUPERADMIN" && user.record_status !== "ACTIVE"}
              >
                {type === "SUPERADMIN" && user.record_status !== "ACTIVE"
                  ? "SUPERADMIN (activate first)"
                  : type}
              </option>
            ))}
          </select>
        )}
        <div
          className="flex gap-2"
          title={isSuperAdmin ? "SUPERADMIN accounts cannot be modified" : undefined}
        >
          <button
            type="button"
            disabled={disabled || user.record_status === "ACTIVE"}
            onClick={() => onActivate(user.userId)}
            className="flex-1 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Activate
          </button>
          <button
            type="button"
            disabled={disabled || user.record_status === "INACTIVE"}
            onClick={() => onDeactivate(user.userId)}
            className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Deactivate
          </button>
        </div>
      </div>

      {viewerType === "SUPERADMIN" && (
        <div className="mt-4">
          <RightsDropdown user={user} disabled={disabled} onToggleRight={onToggleRight} />
        </div>
      )}
    </div>
  );
}

function RightsDropdown({ user, disabled, onToggleRight }) {
  const [open, setOpen] = useState(false);
  const enabledCount = DISPLAY_RIGHTS.filter((r) => Boolean(user.rights?.[r])).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
      >
        <span>Rights</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          {enabledCount}/{DISPLAY_RIGHTS.length}
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Permissions
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DISPLAY_RIGHTS.map((rightName) => (
              <label
                key={rightName}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  disabled
                    ? "cursor-not-allowed border-slate-100 text-slate-400"
                    : "cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(user.rights?.[rightName])}
                  disabled={disabled}
                  onChange={(e) => onToggleRight(user.userId, rightName, e.target.checked)}
                  className="h-4 w-4 accent-emerald-700 disabled:cursor-not-allowed"
                />
                {rightName}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
