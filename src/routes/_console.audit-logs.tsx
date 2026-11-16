import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, DemoNotice, FilterSelect, Mono, PageHeader, Panel, inputCls } from "@/components/plpa/ui";
import { auditLogs } from "@/lib/mock-data";
import { downloadCsv, fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_console/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs · PLPA" }, { name: "description", content: "Chronological record of user activity." }, { property: "og:title", content: "Audit Logs · PLPA" }, { property: "og:description", content: "Chronological record of user activity." }] }),
  component: Audit,
});

const modules = [...new Set(auditLogs.map((a) => a.module))];

function Audit() {
  const [q, setQ] = useState("");
  const [mod, setMod] = useState("");
  const rows = useMemo(() => auditLogs.filter((a) => (!mod || a.module === mod) && (!q || `${a.user} ${a.description} ${a.ip}`.toLowerCase().includes(q.toLowerCase()))), [q, mod]);
  return (
    <>
      <PageHeader title="Audit Logs" description="Who did what, where and when." actions={<Button variant="gold" onClick={() => downloadCsv("audit-logs.csv", rows.map((r) => ({ ...r, time: fmtDateTime(r.time) })))}><Download /> Export CSV</Button>} />
      <DemoNotice />
      <Panel bodyClass="p-0">
        <div className="flex flex-wrap gap-2 border-b p-3">
          <div className="relative min-w-60 flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="User, IP or description" className={`${inputCls} w-full pl-8`} /></div>
          <FilterSelect label="modules" value={mod} onChange={setMod} options={modules} />
        </div>
        <DataTable rows={rows} rowKey={(r) => r.id} pageSize={15} columns={[
          { key: "t", header: "Timestamp", render: (r) => fmtDateTime(r.time), sort: (r) => r.time },
          { key: "u", header: "User", render: (r) => <span className="font-medium">{r.user}</span>, sort: (r) => r.user },
          { key: "a", header: "Action", render: (r) => <span className="font-semibold text-primary">{r.action}</span> },
          { key: "m", header: "Module", render: (r) => r.module },
          { key: "ip", header: "IP address", render: (r) => <Mono>{r.ip}</Mono> },
          { key: "d", header: "Description", render: (r) => <span className="text-xs text-muted-foreground">{r.description}</span> },
        ]} />
      </Panel>
    </>
  );
}
