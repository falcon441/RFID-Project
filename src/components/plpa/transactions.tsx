import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, DemoNotice, FilterSelect, Mono, PageHeader, Panel, Reg, StatusBadge, inputCls, type Column } from "@/components/plpa/ui";
import { VisitDialog } from "@/components/plpa/visit-dialog";
import { ENTRY_GATES, EXIT_GATES, VEHICLE_TYPES, dwellMinutes, exits, visits, type Visit } from "@/lib/mock-data";
import { downloadCsv, fmtDateTime, fmtDuration, pktDay } from "@/lib/format";

/** Shared entry/exit transaction screen. */
export function TransactionsPage({ kind }: { kind: "entry" | "exit" }) {
  const base = kind === "entry" ? visits : exits;
  const ts = (v: Visit) => (kind === "entry" ? v.entryTime : v.exitTime!);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [gate, setGate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sel, setSel] = useState<Visit | null>(null);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return base.filter((v) => {
      const t = ts(v);
      return (
        (!s || v.reg.toLowerCase().includes(s) || v.rfid.toLowerCase().includes(s) || v.id.toLowerCase().includes(s)) &&
        (!type || v.type === type) &&
        (!gate || (kind === "entry" ? v.entryGate : v.exitGate) === gate) &&
        (!from || t >= pktDay(from)) && (!to || t < pktDay(to) + 86400000)
      );
    });
  }, [q, type, gate, from, to]);

  const cols: Column<Visit>[] = kind === "entry"
    ? [
        { key: "id", header: "Transaction", render: (r) => <Mono>{r.id}</Mono>, sort: (r) => r.id },
        { key: "reg", header: "Vehicle", render: (r) => <Reg>{r.reg}</Reg>, sort: (r) => r.reg },
        { key: "rfid", header: "RFID Tag", render: (r) => <Mono>{r.rfid}</Mono> },
        { key: "type", header: "Category", render: (r) => r.type },
        { key: "gate", header: "Entry gate", render: (r) => r.entryGate },
        { key: "t", header: "Entry time", render: (r) => fmtDateTime(r.entryTime), sort: (r) => r.entryTime },
        { key: "read", header: "RFID read", render: (r) => <StatusBadge status={r.readStatus} /> },
        { key: "st", header: "Status", render: (r) => <StatusBadge status={r.txStatus} /> },
      ]
    : [
        { key: "id", header: "Transaction", render: (r) => <Mono>{r.id}</Mono>, sort: (r) => r.id },
        { key: "reg", header: "Vehicle", render: (r) => <Reg>{r.reg}</Reg>, sort: (r) => r.reg },
        { key: "rfid", header: "RFID Tag", render: (r) => <Mono>{r.rfid}</Mono> },
        { key: "in", header: "Entry time", render: (r) => fmtDateTime(r.entryTime), sort: (r) => r.entryTime },
        { key: "t", header: "Exit time", render: (r) => fmtDateTime(r.exitTime), sort: (r) => r.exitTime! },
        { key: "d", header: "Dwell", render: (r) => <span className="font-semibold">{fmtDuration(dwellMinutes(r))}</span>, sort: dwellMinutes },
        { key: "eg", header: "Entry gate", render: (r) => r.entryGate },
        { key: "xg", header: "Exit gate", render: (r) => r.exitGate },
        { key: "st", header: "Status", render: (r) => <StatusBadge status={r.txStatus} /> },
      ];

  const exportCsv = () =>
    downloadCsv(`${kind}-transactions.csv`, rows.map((r) => ({
      transaction: r.id, registration: r.reg, rfid: r.rfid, category: r.type, entry_gate: r.entryGate, entry_time: fmtDateTime(r.entryTime),
      ...(kind === "exit" ? { exit_gate: r.exitGate, exit_time: fmtDateTime(r.exitTime), dwell_minutes: dwellMinutes(r) } : { rfid_read: r.readStatus }),
      status: r.txStatus,
    })));

  return (
    <>
      <PageHeader
        title={kind === "entry" ? "Entry Transactions" : "Exit Transactions"}
        description={kind === "entry" ? "Every RFID entry read recorded at entry lanes." : "Completed visits. Dwell time = exit timestamp − entry timestamp."}
        actions={<Button variant="gold" onClick={exportCsv}><Download /> Export CSV ({rows.length})</Button>}
      />
      <DemoNotice />
      <Panel bodyClass="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Transaction, registration or RFID" className={`${inputCls} w-full pl-8`} />
          </div>
          <FilterSelect label="categories" value={type} onChange={setType} options={VEHICLE_TYPES} />
          <FilterSelect label="gates" value={gate} onChange={setGate} options={kind === "entry" ? ENTRY_GATES : EXIT_GATES} />
          <input type="date" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          <span className="text-xs text-muted-foreground">to</span>
          <input type="date" aria-label="To date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </div>
        <DataTable rows={rows} columns={cols} rowKey={(r) => r.id} onRowClick={setSel} pageSize={15} />
      </Panel>
      <VisitDialog visit={sel} onClose={() => setSel(null)} />
    </>
  );
}
