import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertOctagon, ArrowDownToLine, ArrowUpToLine, Clock } from "lucide-react";
import { DataTable, DemoNotice, FilterSelect, PageHeader, Panel, Reg, StatCard, StatusBadge, inputCls } from "@/components/plpa/ui";
import { HBar, MultiLine, TrendLine } from "@/components/plpa/charts";
import { ENTRY_GATES, PERMITTED_DWELL_MIN, REF_NOW, VEHICLE_TYPES, dwellMinutes, dwellStatus, exits } from "@/lib/mock-data";
import { fmtDuration, pktDay } from "@/lib/format";

export const Route = createFileRoute("/_console/dwell-time")({
  head: () => ({ meta: [{ title: "Dwell-Time Analytics · PLPA" }, { name: "description", content: "Dwell time statistics, trends and category reports." }, { property: "og:title", content: "Dwell-Time Analytics · PLPA" }, { property: "og:description", content: "Dwell time statistics and trends." }] }),
  component: Dwell,
});

const fmtDay = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Karachi" });

function Dwell() {
  const [type, setType] = useState("");
  const [gate, setGate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [period, setPeriod] = useState<"Daily" | "Weekly">("Daily");
  const rows = useMemo(
    () => exits.filter((v) => (!type || v.type === type) && (!gate || v.entryGate === gate) && (!from || v.entryTime >= pktDay(from)) && (!to || v.entryTime < pktDay(to) + 86400000)),
    [type, gate, from, to],
  );
  const mins = rows.map(dwellMinutes);
  const avg = mins.length ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0;
  const over = rows.filter((v) => dwellMinutes(v) >= PERMITTED_DWELL_MIN);

  const trend = useMemo(() => {
    const bucket = period === "Daily" ? 86400000 : 86400000 * 7;
    const n = period === "Daily" ? 14 : 2;
    return Array.from({ length: n }, (_, i) => {
      const end = REF_NOW - (n - 1 - i) * bucket;
      const ms = rows.filter((v) => v.entryTime < end && v.entryTime >= end - bucket).map(dwellMinutes);
      return { label: period === "Daily" ? fmtDay(end) : `Week ending ${fmtDay(end)}`, avg: ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : 0, max: ms.length ? Math.max(...ms) : 0 };
    });
  }, [rows, period]);
  const byType = VEHICLE_TYPES.map((t) => { const ms = rows.filter((v) => v.type === t).map(dwellMinutes); return { name: t, avg: ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : 0, count: ms.length }; });
  const dist = [[0, 120, "< 2h"], [120, 240, "2–4h"], [240, 360, "4–6h"], [360, 480, "6–8h"], [480, 1e9, "> 8h"]].map(([a, b, l]) => ({ label: l as string, visits: mins.filter((m) => m >= (a as number) && m < (b as number)).length }));

  return (
    <>
      <PageHeader title="Dwell-Time Analytics" description="Dwell Time = Exit Timestamp − Entry Timestamp. Permitted limit: 8 hours." />
      <DemoNotice />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterSelect label="vehicle types" value={type} onChange={setType} options={VEHICLE_TYPES} />
        <FilterSelect label="gates" value={gate} onChange={setGate} options={ENTRY_GATES} />
        <input type="date" aria-label="From" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        <span className="text-xs text-muted-foreground">to</span>
        <input type="date" aria-label="To" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} completed visits</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Clock} label="Average dwell" value={fmtDuration(avg)} tone="gold" />
        <StatCard icon={ArrowDownToLine} label="Minimum dwell" value={fmtDuration(mins.length ? Math.min(...mins) : 0)} />
        <StatCard icon={ArrowUpToLine} label="Maximum dwell" value={fmtDuration(mins.length ? Math.max(...mins) : 0)} />
        <StatCard icon={AlertOctagon} label="Exceeded limit" value={over.length} trend={`${mins.length ? Math.round((over.length / mins.length) * 100) : 0}% of visits`} tone="red" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Dwell-time trend" action={
          <div className="flex rounded-sm border text-xs">{(["Daily", "Weekly"] as const).map((p) => <button key={p} onClick={() => setPeriod(p)} className={p === period ? "bg-primary px-2.5 py-1 text-primary-foreground" : "px-2.5 py-1"}>{p}</button>)}</div>
        }><MultiLine data={trend} /></Panel>
        <Panel title="Dwell-time distribution"><TrendLine data={dist} x="label" y="visits" name="Visits" /></Panel>
        <Panel title="Average dwell by vehicle category (min)"><HBar data={byType} dataKey="avg" name="Avg minutes" /></Panel>
        <Panel title="Category report" bodyClass="p-0">
          <DataTable rows={byType} rowKey={(r) => r.name} columns={[
            { key: "n", header: "Category", render: (r) => r.name },
            { key: "c", header: "Visits", render: (r) => r.count, sort: (r) => r.count },
            { key: "a", header: "Avg dwell", render: (r) => fmtDuration(r.avg), sort: (r) => r.avg },
            { key: "s", header: "Status", render: (r) => <StatusBadge status={dwellStatus(r.avg)} /> },
          ]} />
        </Panel>
      </div>
      <Panel title="Vehicle-wise report — longest visits" className="mt-4" bodyClass="p-0">
        <DataTable rows={[...rows].sort((a, b) => dwellMinutes(b) - dwellMinutes(a))} rowKey={(r) => r.id} pageSize={10} columns={[
          { key: "r", header: "Vehicle", render: (r) => <Reg>{r.reg}</Reg> },
          { key: "t", header: "Category", render: (r) => r.type },
          { key: "g", header: "Entry gate", render: (r) => r.entryGate },
          { key: "d", header: "Dwell", render: (r) => <b>{fmtDuration(dwellMinutes(r))}</b>, sort: dwellMinutes },
          { key: "s", header: "Status", render: (r) => <StatusBadge status={dwellStatus(dwellMinutes(r))} /> },
        ]} />
      </Panel>
    </>
  );
}
