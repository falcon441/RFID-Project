import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertOctagon, Clock, DoorOpen, LogIn, LogOut, Truck } from "lucide-react";
import { DataTable, DemoNotice, Mono, PageHeader, Panel, Reg, StatCard, StatusBadge } from "@/components/plpa/ui";
import { Donut, EntryExitChart } from "@/components/plpa/charts";
import { VisitDialog } from "@/components/plpa/visit-dialog";
import { alerts, dailySeries, dwellMinutes, dwellStatus, exits, openVisits, todaysEntries, todaysExits, typeDistribution, visits, type Visit } from "@/lib/mock-data";
import { fmtDateTime, fmtDuration } from "@/lib/format";

export const Route = createFileRoute("/_console/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · PLPA RFID Tracking" }, { name: "description", content: "Port-wide overview of vehicle entries, exits and dwell time." }, { property: "og:title", content: "Dashboard · PLPA RFID Tracking" }, { property: "og:description", content: "Port-wide overview of vehicle entries, exits and dwell time." }] }),
  component: Dashboard,
});

function Dashboard() {
  const [sel, setSel] = useState<Visit | null>(null);
  const completed = exits.slice(0, 200);
  const avg = Math.round(completed.reduce((s, v) => s + dwellMinutes(v), 0) / completed.length);
  const excessive = openVisits.filter((v) => dwellStatus(dwellMinutes(v)) === "Excessive").length;
  const y = dailySeries[12];
  const recent = [
    ...visits.slice(0, 8).map((v) => ({ v, kind: "Entry" as const, t: v.entryTime })),
    ...exits.slice(0, 8).map((v) => ({ v, kind: "Exit" as const, t: v.exitTime! })),
  ].sort((a, b) => b.t - a.t).slice(0, 8);

  return (
    <>
      <PageHeader title="Operations Dashboard" description="Overview of vehicle movement across PLPA land ports." />
      <DemoNotice />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Truck} label="Inside port" value={openVisits.length} trend="Across all gates" />
        <StatCard icon={LogIn} label="Today's entries" value={todaysEntries.length} trend={`Yesterday: ${y.entries}`} />
        <StatCard icon={LogOut} label="Today's exits" value={todaysExits.length} trend={`Yesterday: ${y.exits}`} />
        <StatCard icon={DoorOpen} label="Open visits" value={openVisits.length} trend="Awaiting exit read" tone="gold" />
        <StatCard icon={Clock} label="Avg dwell time" value={fmtDuration(avg)} trend="Last 200 completed visits" tone="gold" />
        <StatCard icon={AlertOctagon} label="Excessive dwell" value={excessive} trend="Over 8h permitted limit" tone="red" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Live vehicle monitoring" className="xl:col-span-2" bodyClass="p-0" action={<Link to="/live" className="text-xs font-semibold text-primary hover:text-gold">View all →</Link>}>
          <DataTable
            rows={openVisits.slice(0, 50)}
            pageSize={7}
            rowKey={(r) => r.id}
            onRowClick={setSel}
            columns={[
              { key: "reg", header: "Vehicle", render: (r) => <Reg>{r.reg}</Reg> },
              { key: "rfid", header: "RFID Tag", render: (r) => <Mono>{r.rfid}</Mono> },
              { key: "type", header: "Type", render: (r) => r.type },
              { key: "gate", header: "Entry gate", render: (r) => r.entryGate },
              { key: "time", header: "Entry", render: (r) => fmtDateTime(r.entryTime), sort: (r) => r.entryTime },
              { key: "dwell", header: "Dwell", render: (r) => fmtDuration(dwellMinutes(r)), sort: dwellMinutes },
              { key: "st", header: "Status", render: (r) => <StatusBadge status={dwellStatus(dwellMinutes(r))} /> },
            ]}
          />
        </Panel>
        <Panel title="Alerts & exceptions" action={<Link to="/alerts" className="text-xs font-semibold text-primary hover:text-gold">Manage →</Link>} bodyClass="p-0">
          <ul className="divide-y">
            {alerts.filter((a) => a.status !== "Resolved").slice(0, 7).map((a) => (
              <li key={a.id} className="flex gap-3 px-4 py-2.5">
                <StatusBadge status={a.severity} className="mt-0.5 h-fit" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.type}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.reg ? `${a.reg} · ` : ""}{a.gate} · {fmtDateTime(a.time)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Entries vs exits — last 14 days" className="xl:col-span-2"><EntryExitChart data={dailySeries} /></Panel>
        <Panel title="Vehicles inside by type"><Donut data={typeDistribution} /></Panel>
      </div>

      <Panel title="Recent transactions" className="mt-4" bodyClass="p-0">
        <DataTable
          rows={recent}
          rowKey={(r) => r.v.id + r.kind}
          onRowClick={(r) => setSel(r.v)}
          columns={[
            { key: "t", header: "Timestamp", render: (r) => fmtDateTime(r.t) },
            { key: "reg", header: "Vehicle", render: (r) => <Reg>{r.v.reg}</Reg> },
            { key: "rfid", header: "RFID Tag", render: (r) => <Mono>{r.v.rfid}</Mono> },
            { key: "g", header: "Gate", render: (r) => (r.kind === "Entry" ? r.v.entryGate : r.v.exitGate) },
            { key: "kind", header: "Movement", render: (r) => <span className={r.kind === "Entry" ? "font-semibold text-primary" : "font-semibold text-gold"}>{r.kind}</span> },
            { key: "s", header: "Read status", render: (r) => <StatusBadge status={r.v.readStatus} /> },
          ]}
        />
      </Panel>
      <VisitDialog visit={sel} onClose={() => setSel(null)} />
    </>
  );
}
