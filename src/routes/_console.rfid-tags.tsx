import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, Link2, Plus, Power, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, DemoNotice, Field, FilterSelect, Mono, PageHeader, Panel, Reg, StatCard, StatusBadge, inputCls } from "@/components/plpa/ui";
import { REF_NOW, rfidTags, vehicles, type RfidTag } from "@/lib/mock-data";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/_console/rfid-tags")({
  head: () => ({ meta: [{ title: "RFID Tag Management · PLPA" }, { name: "description", content: "Register, assign and block RFID tags." }, { property: "og:title", content: "RFID Tag Management · PLPA" }, { property: "og:description", content: "Register, assign and block RFID tags." }] }),
  component: Tags,
});

function Tags() {
  const [list, setList] = useState(rfidTags);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [form, setForm] = useState<{ id: string; vehicle: string; lanes: string; isNew: boolean } | null>(null);
  const rows = useMemo(() => list.filter((t) => (!q || t.id.toLowerCase().includes(q.toLowerCase()) || t.vehicle?.toLowerCase().includes(q.toLowerCase())) && (!st || t.status === st)), [list, q, st]);
  const setStatus = (t: RfidTag, status: RfidTag["status"]) => { setList((l) => l.map((x) => (x.id === t.id ? { ...x, status } : x))); toast.success(`Tag ${t.id} set to ${status}`); };
  const save = () => {
    if (!form?.id.trim()) return toast.error("Tag ID is required.");
    if (form.isNew) {
      if (list.some((t) => t.id === form.id)) return toast.error("Tag already registered.");
      setList((l) => [{ id: form.id, vehicle: form.vehicle || undefined, lanes: form.lanes, status: "Active", registered: REF_NOW }, ...l]);
    } else setList((l) => l.map((t) => (t.id === form.id ? { ...t, vehicle: form.vehicle || undefined, lanes: form.lanes } : t)));
    toast.success(form.isNew ? "Tag registered" : "Tag assignment updated");
    setForm(null);
  };

  return (
    <>
      <PageHeader title="RFID Tag Management" description="Passive UHF tags issued to registered vehicles." actions={<Button variant="gold" onClick={() => setForm({ id: "", vehicle: "", lanes: "All lanes", isNew: true })}><Plus /> Register tag</Button>} />
      <DemoNotice />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Tag} label="Total tags" value={list.length} />
        <StatCard icon={Tag} label="Active" value={list.filter((t) => t.status === "Active").length} />
        <StatCard icon={Tag} label="Inactive" value={list.filter((t) => t.status === "Inactive").length} tone="gold" />
        <StatCard icon={Tag} label="Blocked" value={list.filter((t) => t.status === "Blocked").length} tone="red" />
      </div>
      <Panel bodyClass="p-0">
        <div className="flex flex-wrap gap-2 border-b p-3">
          <div className="relative min-w-60 flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tag ID or vehicle" className={`${inputCls} w-full pl-8`} /></div>
          <FilterSelect label="statuses" value={st} onChange={setSt} options={["Active", "Inactive", "Blocked"]} />
        </div>
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          pageSize={15}
          columns={[
            { key: "id", header: "Tag ID", render: (r) => <Mono>{r.id}</Mono>, sort: (r) => r.id },
            { key: "v", header: "Vehicle", render: (r) => (r.vehicle ? <Reg>{r.vehicle}</Reg> : <span className="text-xs text-muted-foreground">Unassigned</span>) },
            { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "reg", header: "Registered", render: (r) => fmtDate(r.registered), sort: (r) => r.registered },
            { key: "seen", header: "Last detected", render: (r) => fmtDateTime(r.lastSeen), sort: (r) => r.lastSeen ?? 0 },
            { key: "l", header: "Lanes", render: (r) => <span className="text-xs">{r.lanes}</span> },
            {
              key: "a", header: "", render: (r) => (
                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" aria-label="Assign" onClick={() => setForm({ id: r.id, vehicle: r.vehicle ?? "", lanes: r.lanes, isNew: false })}><Link2 /></Button>
                  <Button size="icon" variant="ghost" aria-label="Toggle active" onClick={() => setStatus(r, r.status === "Active" ? "Inactive" : "Active")}><Power /></Button>
                  <Button size="icon" variant="ghost" aria-label="Block" onClick={() => setStatus(r, "Blocked")}><Ban className="text-destructive" /></Button>
                </div>
              ),
            },
          ]}
        />
      </Panel>
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-primary">{form?.isNew ? "Register RFID tag" : "Assign RFID tag"}</DialogTitle></DialogHeader>
          {form && (
            <div className="grid gap-3">
              <Field label="Tag ID (EPC)"><input disabled={!form.isNew} className={inputCls} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="E200-XXXX-0000" /></Field>
              <Field label="Assigned vehicle">
                <select className={inputCls} value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                  <option value="">Unassigned</option>
                  {vehicles.map((v) => <option key={v.id} value={v.reg}>{v.reg} — {v.owner}</option>)}
                </select>
              </Field>
              <Field label="Permitted lanes"><select className={inputCls} value={form.lanes} onChange={(e) => setForm({ ...form, lanes: e.target.value })}>{["All lanes", "Torkham E-1/E-2, X-1", "Chaman E-3, X-2"].map((l) => <option key={l}>{l}</option>)}</select></Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setForm(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
