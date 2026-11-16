import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoNotice, PageHeader, Panel, inputCls } from "@/components/plpa/ui";
import { alerts, dailySeries, dwellMinutes, exits, openVisits, rfidTags, visits, type Visit } from "@/lib/mock-data";
import { downloadCsv, fmtDateTime, pktDay } from "@/lib/format";

export const Route = createFileRoute("/_console/reports")({
  head: () => ({ meta: [{ title: "Reports · PLPA" }, { name: "description", content: "Generate and export operational reports." }, { property: "og:title", content: "Reports · PLPA" }, { property: "og:description", content: "Generate and export operational reports." }] }),
  component: Reports,
});

const visitRow = (v: Visit) => ({ transaction: v.id, registration: v.reg, rfid: v.rfid, type: v.type, entry_gate: v.entryGate, entry_time: fmtDateTime(v.entryTime), exit_gate: v.exitGate ?? "", exit_time: fmtDateTime(v.exitTime), dwell_minutes: dwellMinutes(v) });

function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const inRange = (t?: number) => !!t && (!from || t >= pktDay(from)) && (!to || t < pktDay(to) + 86400000);
  const reports: { name: string; desc: string; rows: () => Record<string, unknown>[] }[] = [
    { name: "Daily Entry Report", desc: "All entry reads in the selected range.", rows: () => visits.filter((v) => inRange(v.entryTime)).map(visitRow) },
    { name: "Daily Exit Report", desc: "All exit reads with dwell time.", rows: () => exits.filter((v) => inRange(v.exitTime)).map(visitRow) },
    { name: "Vehicles Currently Inside", desc: "Open visits at time of export.", rows: () => openVisits.map(visitRow) },
    { name: "Vehicle Visit History", desc: "Complete visit history (filter by registration).", rows: () => visits.filter((v) => !q || v.reg.toLowerCase().includes(q.toLowerCase())).map(visitRow) },
    { name: "Dwell-Time Report", desc: "Completed visits with dwell minutes.", rows: () => exits.filter((v) => inRange(v.entryTime)).map(visitRow) },
    { name: "RFID Activity Report", desc: "Tag status and last detection.", rows: () => rfidTags.map((t) => ({ tag: t.id, vehicle: t.vehicle ?? "", status: t.status, last_detected: fmtDateTime(t.lastSeen), lanes: t.lanes })) },
    { name: "Exception Report", desc: "Alerts and exceptions raised.", rows: () => alerts.filter((a) => inRange(a.time)).map((a) => ({ id: a.id, type: a.type, severity: a.severity, vehicle: a.reg ?? "", gate: a.gate, time: fmtDateTime(a.time), status: a.status })) },
    { name: "Monthly Performance Report", desc: "Daily totals and average dwell.", rows: () => dailySeries.map((d) => ({ ...d })) },
  ];
  const run = (r: (typeof reports)[number]) => {
    const rows = r.rows();
    if (!rows.length) return toast.error("No records in the selected range.");
    downloadCsv(`${r.name.toLowerCase().replace(/\s+/g, "-")}.csv`, rows);
    toast.success(`${r.name} exported (${rows.length} rows)`);
  };
  return (
    <>
      <PageHeader title="Reports" description="Export sample reports to CSV. Filters apply where relevant." />
      <DemoNotice />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input type="date" aria-label="From" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        <span className="text-xs text-muted-foreground">to</span>
        <input type="date" aria-label="To" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        <div className="relative min-w-60"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Registration (visit history)" className={`${inputCls} w-full pl-8`} /></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((r) => (
          <Panel key={r.name}>
            <FileText className="size-5 text-gold" />
            <h3 className="mt-2 font-semibold text-primary">{r.name}</h3>
            <p className="mt-1 min-h-10 text-xs text-muted-foreground">{r.desc}</p>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => run(r)}><Download /> Export CSV</Button>
          </Panel>
        ))}
      </div>
    </>
  );
}
