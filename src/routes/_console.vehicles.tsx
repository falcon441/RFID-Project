import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, DemoNotice, Field, FilterSelect, Mono, PageHeader, Panel, Reg, StatusBadge, inputCls } from "@/components/plpa/ui";
import { VisitDialog } from "@/components/plpa/visit-dialog";
import { VEHICLE_TYPES, vehicles as seed, visits, type Vehicle, type Visit } from "@/lib/mock-data";

export const Route = createFileRoute("/_console/vehicles")({
  head: () => ({ meta: [{ title: "Vehicle Management · PLPA" }, { name: "description", content: "Register and manage vehicles and their RFID tags." }, { property: "og:title", content: "Vehicle Management · PLPA" }, { property: "og:description", content: "Register and manage vehicles." }] }),
  component: Vehicles,
});

const blank: Vehicle = { id: "", reg: "", type: "Container Truck", rfid: "", owner: "", driver: "", contact: "", status: "Active" };

function Vehicles() {
  const [list, setList] = useState(seed);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [edit, setEdit] = useState<Vehicle | null>(null);
  const [hist, setHist] = useState<Visit | null>(null);
  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return list.filter((v) => (!s || [v.reg, v.rfid, v.owner, v.driver].some((x) => x.toLowerCase().includes(s))) && (!type || v.type === type));
  }, [list, q, type]);

  const save = () => {
    if (!edit) return;
    if (!edit.reg.trim() || !edit.rfid.trim()) return toast.error("Registration number and RFID tag are required.");
    if (list.some((v) => v.reg === edit.reg && v.id !== edit.id)) return toast.error("A vehicle with this registration already exists.");
    if (edit.id) setList((l) => l.map((v) => (v.id === edit.id ? edit : v)));
    else setList((l) => [{ ...edit, id: `V${Date.now()}` }, ...l]);
    toast.success(edit.id ? "Vehicle updated" : "Vehicle registered");
    setEdit(null);
  };
  const set = (k: keyof Vehicle) => (e: { target: { value: string } }) => setEdit((x) => x && { ...x, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Vehicle Management" description="Registered vehicles and their assigned RFID tags." actions={<Button variant="gold" onClick={() => setEdit(blank)}><Plus /> Register vehicle</Button>} />
      <DemoNotice />
      <Panel bodyClass="p-0">
        <div className="flex flex-wrap gap-2 border-b p-3">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Registration, RFID, owner or driver" className={`${inputCls} w-full pl-8`} />
          </div>
          <FilterSelect label="vehicle types" value={type} onChange={setType} options={VEHICLE_TYPES} />
        </div>
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          pageSize={15}
          columns={[
            { key: "reg", header: "Registration", render: (r) => <Reg>{r.reg}</Reg>, sort: (r) => r.reg },
            { key: "type", header: "Type", render: (r) => r.type, sort: (r) => r.type },
            { key: "rfid", header: "RFID Tag", render: (r) => <Mono>{r.rfid}</Mono> },
            { key: "owner", header: "Owner / company", render: (r) => r.owner, sort: (r) => r.owner },
            { key: "driver", header: "Driver", render: (r) => r.driver },
            { key: "contact", header: "Contact", render: (r) => <span className="text-xs">{r.contact}</span> },
            { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "a", header: "", render: (r) => (
                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" aria-label="History" onClick={() => { const v = visits.find((x) => x.vehicleId === r.id); v ? setHist(v) : toast.info("No visits recorded for this vehicle."); }}><History /></Button>
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEdit(r)}><Pencil /></Button>
                  <Button size="icon" variant="ghost" aria-label="Deactivate" onClick={() => { setList((l) => l.map((v) => (v.id === r.id ? { ...v, status: v.status === "Inactive" ? "Active" : "Inactive" } : v))); toast.success(r.status === "Inactive" ? "Vehicle reactivated" : "Vehicle deactivated"); }}><Trash2 className="text-destructive" /></Button>
                </div>
              ),
            },
          ]}
        />
      </Panel>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-primary">{edit?.id ? "Edit vehicle" : "Register vehicle"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Registration number *"><input className={inputCls} value={edit.reg} onChange={set("reg")} /></Field>
              <Field label="Vehicle type"><select className={inputCls} value={edit.type} onChange={set("type")}>{VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="RFID tag ID *"><input className={inputCls} value={edit.rfid} onChange={set("rfid")} /></Field>
              <Field label="Status"><select className={inputCls} value={edit.status} onChange={set("status")}>{["Active", "Inactive", "Blacklisted"].map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Owner / company"><input className={inputCls} value={edit.owner} onChange={set("owner")} /></Field>
              <Field label="Driver name"><input className={inputCls} value={edit.driver} onChange={set("driver")} /></Field>
              <Field label="Contact"><input className={inputCls} value={edit.contact} onChange={set("contact")} /></Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <VisitDialog visit={hist} onClose={() => setHist(null)} />
    </>
  );
}
