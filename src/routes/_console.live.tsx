import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable, DemoNotice, FilterSelect, Mono, PageHeader, Panel, Reg, StatCard, StatusBadge, inputCls } from "@/components/plpa/ui";
import { VisitDialog } from "@/components/plpa/visit-dialog";
import { ENTRY_GATES, VEHICLE_TYPES, dwellMinutes, dwellStatus, openVisits, type Visit } from "@/lib/mock-data";
import { fmtDateTime, fmtDuration } from "@/lib/format";
import { AlertOctagon, Clock, Truck } from "lucide-react";

export const Route = createFileRoute("/_console/live")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s.q === "string" && s.q ? { q: s.q } : {}),
  head: () => ({ meta: [{ title: "Live Vehicle Monitoring · PLPA" }, { name: "description", content: "All vehicles currently inside the port with dwell-time status." }, { property: "og:title", content: "Live Vehicle Monitoring · PLPA" }, { property: "og:description", content: "All vehicles currently inside the port." }] }),
  component: Live,
});

function Live() {
  const { q: q0 } = Route.useSearch();
  const [q, setQ] = useState(q0 ?? "");
  const [type, setType] = useState("");
  const [gate, setGate] = useState("");
  const [st, setSt] = useState("");
  const [sel, setSel] = useState<Visit | null>(null);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return openVisits.filter(
      (v) =>
        (!s || v.reg.toLowerCase().includes(s) || v.rfid.toLowerCase().includes(s)) &&
        (!type || v.type === type) && (!gate || v.entryGate === gate) && (!st || dwellStatus(dwellMinutes(v)) === st),
    );
  }, [q, type, gate, st]);
  const count = (s: string) => openVisits.filter((v) => dwellStatus(dwellMinutes(v)) === s).length;

  return (
    <>
      <PageHeader title="Live Vehicle Monitoring" description="Vehicles with an open visit (entry read, no exit read yet)." />
      <DemoNotice />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Truck} label="Total inside" value={openVisits.length} />
        <StatCard icon={Clock} label="Warning (6–8h)" value={count("Warning")} tone="gold" />
        <StatCard icon={AlertOctagon} label="Excessive (>8h)" value={count("Excessive")} tone="red" />
      </div>
      <Panel bodyClass="p-0">
        <div className="flex flex-wrap gap-2 border-b p-3">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Registration number or RFID tag" className={`${inputCls} w-full pl-8`} />
          </div>
          <FilterSelect label="vehicle types" value={type} onChange={setType} options={VEHICLE_TYPES} />
          <FilterSelect label="entry gates" value={gate} onChange={setGate} options={ENTRY_GATES} />
          <FilterSelect label="dwell statuses" value={st} onChange={setSt} options={["Normal", "Warning", "Excessive"]} />
        </div>
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={setSel}
          pageSize={15}
          columns={[
            { key: "reg", header: "Vehicle", render: (r) => <Reg>{r.reg}</Reg>, sort: (r) => r.reg },
            { key: "rfid", header: "RFID Tag", render: (r) => <Mono>{r.rfid}</Mono> },
            { key: "type", header: "Type", render: (r) => r.type, sort: (r) => r.type },
            { key: "gate", header: "Entry gate", render: (r) => r.entryGate },
            { key: "time", header: "Entry time", render: (r) => fmtDateTime(r.entryTime), sort: (r) => r.entryTime },
            { key: "dwell", header: "Current dwell", render: (r) => <span className="font-semibold tabular-nums">{fmtDuration(dwellMinutes(r))}</span>, sort: dwellMinutes },
            { key: "loc", header: "Location", render: () => <StatusBadge status="Inside Port" /> },
            { key: "st", header: "Status", render: (r) => <StatusBadge status={dwellStatus(dwellMinutes(r))} /> },
          ]}
        />
      </Panel>
      <VisitDialog visit={sel} onClose={() => setSel(null)} />
    </>
  );
}
