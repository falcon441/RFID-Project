import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, DemoNotice, FilterSelect, Mono, PageHeader, Panel, Reg, StatusBadge } from "@/components/plpa/ui";
import { alerts as seed, type Alert } from "@/lib/mock-data";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_console/alerts")({
  head: () => ({ meta: [{ title: "Alerts & Exceptions · PLPA" }, { name: "description", content: "Acknowledge and resolve system alerts and exceptions." }, { property: "og:title", content: "Alerts & Exceptions · PLPA" }, { property: "og:description", content: "System alerts and exceptions." }] }),
  component: Alerts,
});

const SEV = ["Critical", "High", "Medium", "Low"] as const;

function Alerts() {
  const [list, setList] = useState(seed);
  const [sev, setSev] = useState("");
  const [st, setSt] = useState("");
  const rows = useMemo(() => list.filter((a) => (!sev || a.severity === sev) && (!st || a.status === st)), [list, sev, st]);
  const act = (a: Alert, status: Alert["status"]) => { setList((l) => l.map((x) => (x.id === a.id ? { ...x, status } : x))); toast.success(`${a.id} ${status.toLowerCase()}`); };
  return (
    <>
      <PageHeader title="Alerts & Exceptions" description="Exceptions raised by gate lanes and the dwell-time engine." />
      <DemoNotice />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SEV.map((s) => (
          <button key={s} onClick={() => setSev(sev === s ? "" : s)} className={cn("rounded-md border bg-card p-4 text-left shadow-card", sev === s && "border-gold ring-2 ring-gold/30")}>
            <StatusBadge status={s} />
            <p className="mt-2 font-display text-2xl">{list.filter((a) => a.severity === s && a.status !== "Resolved").length}</p>
            <p className="text-xs text-muted-foreground">unresolved</p>
          </button>
        ))}
      </div>
      <Panel bodyClass="p-0">
        <div className="flex flex-wrap gap-2 border-b p-3">
          <FilterSelect label="severities" value={sev} onChange={setSev} options={SEV} />
          <FilterSelect label="statuses" value={st} onChange={setSt} options={["Open", "Acknowledged", "Resolved"]} />
        </div>
        <DataTable rows={rows} rowKey={(r) => r.id} pageSize={15} columns={[
          { key: "id", header: "Alert ID", render: (r) => <Mono>{r.id}</Mono> },
          { key: "sev", header: "Severity", render: (r) => <StatusBadge status={r.severity} />, sort: (r) => SEV.indexOf(r.severity) * -1 },
          { key: "t", header: "Type", render: (r) => <span className="font-medium">{r.type}</span> },
          { key: "v", header: "Vehicle", render: (r) => (r.reg ? <Reg>{r.reg}</Reg> : "—") },
          { key: "g", header: "Gate", render: (r) => r.gate },
          { key: "time", header: "Date & time", render: (r) => fmtDateTime(r.time), sort: (r) => r.time },
          { key: "d", header: "Description", render: (r) => <span className="block max-w-xs truncate text-xs text-muted-foreground" title={r.description}>{r.description}</span> },
          { key: "s", header: "Resolution", render: (r) => <StatusBadge status={r.status} /> },
          { key: "a", header: "", render: (r) => (
            <div className="flex justify-end gap-1">
              {r.status === "Open" && <Button size="sm" variant="outline" onClick={() => act(r, "Acknowledged")}>Acknowledge</Button>}
              {r.status !== "Resolved" && <Button size="sm" onClick={() => act(r, "Resolved")}>Resolve</Button>}
            </div>
          ) },
        ]} />
      </Panel>
    </>
  );
}
