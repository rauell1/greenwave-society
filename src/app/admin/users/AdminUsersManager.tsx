"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isExecutiveRoleName } from "@/lib/auth/executive-roles";

type Role = { id: string; name: string; description: string | null };
type User = { id: string; email: string; isActive: boolean; isExecutive: boolean; isRecordedExecutive: boolean; roles: Role[] };

function RolePills({ label, roles, selectedIds, onToggle }: { label: string; roles: Role[]; selectedIds: string[]; onToggle: (role: Role) => void }) {
  return <fieldset><legend className="text-sm font-medium text-slate-700">{label}</legend><div className="mt-2 flex flex-wrap gap-2">{roles.map(role => <label key={role.id} className={`cursor-pointer rounded-full border px-3 py-2 text-sm ${selectedIds.includes(role.id) ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600"}`}><input className="sr-only" type="checkbox" checked={selectedIds.includes(role.id)} onChange={() => onToggle(role)} />{role.name}</label>)}</div></fieldset>;
}

function RoleCards({ roles, user, disabled, onToggle }: { roles: Role[]; user: User; disabled: boolean; onToggle: (role: Role) => void }) {
  return <fieldset disabled={disabled} className="mt-3 grid gap-2 sm:grid-cols-2">{roles.map(role => { const checked = user.roles.some(item => item.id === role.id); return <label key={role.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${checked ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="checkbox" checked={checked} onChange={() => onToggle(role)} className="mt-0.5 h-4 w-4 accent-emerald-700" /><span><span className="block text-sm font-medium text-slate-900">{role.name}</span>{role.description ? <span className="mt-0.5 block text-xs leading-5 text-slate-500">{role.description}</span> : null}</span></label>; })}</fieldset>;
}

export default function AdminUsersManager({ currentUserId, canManageAccess }: { currentUserId: string; canManageAccess: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");
  const [newRoles, setNewRoles] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUsers(data.users); setRoles(data.roles);
      setSelectedId(current => current ?? data.users[0]?.id ?? null);
    } catch { setMessage("Administrators could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const visibleUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? users.filter(user => user.email.toLowerCase().includes(value) || user.roles.some(role => role.name.toLowerCase().includes(value))) : users;
  }, [query, users]);
  const selected = users.find(user => user.id === selectedId) ?? null;
  const selectedIsExecutive = selected ? selected.isRecordedExecutive || selected.roles.some(role => role.name === "Owner" || isExecutiveRoleName(role.name)) : false;
  const activeCount = users.filter(user => user.isActive).length;
  const executiveRoles = roles.filter(role => isExecutiveRoleName(role.name));
  const accessRoles = roles.filter(role => !isExecutiveRoleName(role.name));

  function toggleRole(userId: string, role: Role) {
    setUsers(values => values.map(user => user.id !== userId ? user : { ...user, roles: user.roles.some(item => item.id === role.id) ? user.roles.filter(item => item.id !== role.id) : [...user.roles, role] }));
  }
  function setExecutiveRole(userId: string, roleId: string) {
    setUsers(values => values.map(user => {
      if (user.id !== userId) return user;
      const otherRoles = user.roles.filter(role => !isExecutiveRoleName(role.name));
      const executiveRole = executiveRoles.find(role => role.id === roleId);
      return { ...user, roles: executiveRole ? [...otherRoles, executiveRole] : otherRoles };
    }));
  }
  async function create() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, roleIds: newRoles }) });
      const data = await response.json(); setMessage(response.ok ? data.setup : data.error);
      if (response.ok) { setEmail(""); setNewRoles([]); setShowAdd(false); await load(); }
    } catch { setMessage("The administrator could not be added."); }
    finally { setSaving(false); }
  }
  async function save(user: User) {
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: user.isActive, roleIds: user.roles.map(role => role.id) }) });
      const data = await response.json(); setMessage(response.ok ? "Access updated successfully." : data.error);
      if (response.ok) await load();
    } catch { setMessage("Access could not be updated."); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Administration</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">Administrators</h1><p className="mt-1 text-sm text-slate-500">{canManageAccess ? "Invite administrators and control their access by role." : "View administrator accounts, executive positions, and assigned access."}</p></div>{canManageAccess ? <button onClick={() => setShowAdd(value => !value)} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">{showAdd ? "Cancel" : "Add administrator"}</button> : <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">Read-only access</span>}</header>

    <section className="grid gap-3 sm:grid-cols-3">{[{ label: "Administrators", value: users.length, color: "text-slate-950" }, { label: "Active accounts", value: activeCount, color: "text-emerald-700" }, { label: "Available roles", value: roles.length, color: "text-slate-950" }].map(item => <div key={item.label} className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{item.label}</p><p className={`mt-1 text-2xl font-semibold ${item.color}`}>{item.value}</p></div>)}</section>

    {showAdd ? <section className="rounded-xl border bg-white p-5"><div><h2 className="font-semibold text-slate-900">Add administrator</h2><p className="mt-1 text-sm text-slate-500">Assign an executive position for committee access, then add operational access only where needed.</p></div><div className="mt-4 grid gap-5 lg:grid-cols-2"><label className="text-sm font-medium text-slate-700">Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.org" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label><label className="text-sm font-medium text-slate-700">Executive position<select value={newRoles.find(id => executiveRoles.some(role => role.id === id)) ?? ""} onChange={event => setNewRoles(values => [...values.filter(id => !executiveRoles.some(role => role.id === id)), ...(event.target.value ? [event.target.value] : [])])} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-600"><option value="">Not an executive committee position</option>{executiveRoles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label></div><details className="mt-4 rounded-lg border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-medium text-slate-700">Additional operational access</summary><div className="mt-3"><RolePills label="Permission bundles" roles={accessRoles} selectedIds={newRoles} onToggle={role => setNewRoles(values => values.includes(role.id) ? values.filter(id => id !== role.id) : [...values, role.id])} /></div></details><div className="mt-4 flex justify-end"><button onClick={() => void create()} disabled={!email || newRoles.length === 0 || saving} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{saving ? "Adding…" : "Add administrator"}</button></div></section> : null}
    {message ? <p role="status" className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}

    <section className="grid min-h-[480px] overflow-hidden rounded-xl border bg-white lg:grid-cols-[minmax(280px,0.75fr)_1.4fr]">
      <div className="border-b lg:border-b-0 lg:border-r"><div className="border-b p-4"><label htmlFor="admin-search" className="sr-only">Search administrators</label><input id="admin-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search email or role…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></div><div className="max-h-[560px] divide-y overflow-y-auto">{loading ? <p className="p-6 text-sm text-slate-500">Loading administrators…</p> : visibleUsers.length === 0 ? <p className="p-6 text-sm text-slate-500">No administrators match this search.</p> : visibleUsers.map(user => <button key={user.id} onClick={() => setSelectedId(user.id)} className={`w-full px-4 py-4 text-left hover:bg-slate-50 ${selectedId === user.id ? "bg-emerald-50" : ""}`}><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-slate-900">{user.email}{user.id === currentUserId ? " (you)" : ""}</p><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-300"}`} aria-label={user.isActive ? "Active" : "Disabled"} /></div><div className="mt-1 flex items-center gap-2"><p className="truncate text-xs text-slate-500">{user.roles.map(role => role.name).join(", ") || "No roles"}</p>{user.isExecutive ? <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Executive</span> : null}</div></button>)}</div></div>
      <div className="p-5 sm:p-6">{selected ? <div className="mx-auto max-w-2xl"><div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="break-all font-semibold text-slate-950">{selected.email}</p><p className="mt-1 text-xs text-slate-500">{selected.id === currentUserId ? "This is your account. Your own access cannot be changed here." : canManageAccess ? "Choose the roles this administrator needs." : "Account and access details are read-only."}</p></div><label className={`flex items-center gap-2 text-sm font-medium ${!canManageAccess || selected.id === currentUserId ? "text-slate-400" : "text-slate-700"}`}><input type="checkbox" checked={selected.isActive} disabled={!canManageAccess || selected.id === currentUserId} onChange={event => setUsers(values => values.map(user => user.id === selected.id ? { ...user, isActive: event.target.checked } : user))} className="h-4 w-4 accent-emerald-700" />Active account</label></div>
        <div className="mt-5 space-y-6"><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-900">Executive committee position</h3>{selectedIsExecutive ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Committee member</span> : null}</div><p className="mt-1 text-xs text-slate-500">Executive positions include dashboard, Governance, and Careers review access.</p><select disabled={!canManageAccess || selected.id === currentUserId} value={selected.roles.find(role => isExecutiveRoleName(role.name))?.id ?? ""} onChange={event => setExecutiveRole(selected.id, event.target.value)} className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-500"><option value="">No executive position assigned</option>{executiveRoles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></div><div><h3 className="text-sm font-semibold text-slate-900">Operational access</h3><p className="mt-1 text-xs text-slate-500">{canManageAccess ? "Add permissions for the systems this administrator actively manages." : "Permission bundles assigned to this administrator."}</p><RoleCards roles={accessRoles} user={selected} disabled={!canManageAccess || selected.id === currentUserId} onToggle={role => toggleRole(selected.id, role)} /></div></div>
        {canManageAccess && selected.id !== currentUserId ? <div className="mt-6 flex items-center justify-between gap-4 border-t pt-5"><p className="text-xs text-slate-500">Disabling an account immediately revokes its sessions.</p><button onClick={() => void save(selected)} disabled={saving || selected.roles.length === 0} className="shrink-0 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{saving ? "Saving…" : "Save access"}</button></div> : null}</div> : <div className="flex h-full min-h-64 items-center justify-center text-sm text-slate-500">Select an administrator to view access.</div>}</div>
    </section>
  </div>;
}
