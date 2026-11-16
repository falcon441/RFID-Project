import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, DemoNotice, Field, PageHeader, Panel, StatusBadge, inputCls } from "@/components/plpa/ui";
import { REF_NOW, ROLES, users as seed, type User } from "@/lib/mock-data";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_console/users")({
  head: () => ({ meta: [{ title: "User Management · PLPA" }, { name: "description", content: "Manage console users, roles and permissions." }, { property: "og:title", content: "User Management · PLPA" }, { property: "og:description", content: "Manage console users and roles." }] }),
  component: Users,
});

const MODULES = ["Dashboard", "Live monitoring", "Transactions", "Vehicles & tags", "Gates", "Analytics & reports", "Alerts", "Users", "Settings"];
const defaultPerms: Record<string, number> = { "Super Administrator": 9, Administrator: 8, Supervisor: 7, "Gate Operator": 4, "Security Staff": 3, "Report Viewer": 6 };

function Users() {
  const [list, setList] = useState(seed);
  const [edit, setEdit] = useState<User | null>(null);
  const [perms, setPerms] = useState(() => Object.fromEntries(ROLES.map((r) => [r, MODULES.map((_, i) => i < defaultPerms[r])])));
  const save = () => {
    if (!edit?.name || !edit.email.includes("@")) return toast.error("Name and a valid email are required.");
    setList((l) => (edit.id ? l.map((u) => (u.id === edit.id ? edit : u)) : [{ ...edit, id: `U${Date.now()}` }, ...l]));
    toast.success(edit.id ? "User updated" : "User added");
    setEdit(null);
  };
  return (
    <>
      <PageHeader title="User Management" description="Role-based access to the console." actions={<Button variant="gold" onClick={() => setEdit({ id: "", name: "", email: "", role: "Gate Operator", active: true, lastLogin: REF_NOW })}><Plus /> Add user</Button>} />
      <DemoNotice />
      <Panel bodyClass="p-0">
        <DataTable rows={list} rowKey={(r) => r.id} columns={[
          { key: "n", header: "Name", render: (r) => <span className="font-medium">{r.name}</span>, sort: (r) => r.name },
          { key: "e", header: "Email", render: (r) => <span className="text-xs">{r.email}</span> },
          { key: "r", header: "Role", render: (r) => r.role, sort: (r) => r.role },
          { key: "l", header: "Last login", render: (r) => fmtDateTime(r.lastLogin), sort: (r) => r.lastLogin },
          { key: "s", header: "Status", render: (r) => <StatusBadge status={r.active ? "Active" : "Inactive"} /> },
          { key: "a", header: "", render: (r) => (
            <div className="flex items-center justify-end gap-2">
              <Switch aria-label="Active" checked={r.active} onCheckedChange={(c) => { setList((l) => l.map((u) => (u.id === r.id ? { ...u, active: c } : u))); toast.success(`${r.name} ${c ? "activated" : "deactivated"}`); }} />
              <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEdit(r)}><Pencil /></Button>
            </div>
          ) },
        ]} />
      </Panel>
      <Panel title="Role permissions matrix" className="mt-4" bodyClass="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b bg-secondary/60"><th className="p-2.5 text-left text-primary">Module</th>{ROLES.map((r) => <th key={r} className="p-2.5 text-primary">{r}</th>)}</tr></thead>
          <tbody>
            {MODULES.map((m, i) => (
              <tr key={m} className="border-b last:border-0">
                <td className="p-2.5 font-medium">{m}</td>
                {ROLES.map((r) => (
                  <td key={r} className="p-2.5 text-center">
                    <input type="checkbox" aria-label={`${r} ${m}`} className="accent-[var(--primary)]" disabled={r === "Super Administrator"} checked={perms[r][i]} onChange={() => setPerms((p) => ({ ...p, [r]: p[r].map((x, j) => (j === i ? !x : x)) }))} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-primary">{edit?.id ? "Edit user" : "Add user"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <Field label="Full name"><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="Email"><input className={inputCls} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
              <Field label="Role"><select className={inputCls} value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as User["role"] })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
