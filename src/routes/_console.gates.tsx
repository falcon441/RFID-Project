import { createFileRoute } from "@tanstack/react-router";
import { Antenna, Cpu, Radar, Wifi } from "lucide-react";
import { DemoNotice, PageHeader, Panel, StatusBadge } from "@/components/plpa/ui";
import { REF_NOW, gates, type Health } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_console/gates")({
  head: () => ({ meta: [{ title: "Gate Management · PLPA" }, { name: "description", content: "Entry and exit gate equipment health." }, { property: "og:title", content: "Gate Management · PLPA" }, { property: "og:description", content: "Entry and exit gate equipment health." }] }),
  component: Gates,
});

const ago = (t: number) => { const s = Math.round((REF_NOW - t) / 1000); return s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago`; };
const worst = (hs: Health[]) => (hs.includes("Offline") ? "Offline" : hs.includes("Warning") ? "Warning" : "Online");

function Gates() {
  return (
    <>
      <PageHeader title="Gate Management" description="RFID reader, antenna, radar and network status per lane (simulated sample values)." />
      <DemoNotice />
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-success" /> Online</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-gold" /> Warning</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-destructive" /> Offline</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gates.map((g) => {
          const overall = worst([g.reader, g.antenna, g.radar, g.network]);
          return (
            <Panel key={g.id} title={<>{g.name}</>} action={<StatusBadge status={overall} />}>
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Gate <b className="font-mono text-foreground">{g.number}</b> · {g.type}</span>
                <span>Last comm: {ago(g.lastComm)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([["RFID reader", g.reader, Cpu], ["Antenna", g.antenna, Antenna], ["Radar detection", g.radar, Radar], ["Network", g.network, Wifi]] as const).map(([l, h, I]) => (
                  <div key={l} className="flex items-center gap-2 rounded-sm border bg-background p-2.5">
                    <I className={cn("size-4", h === "Online" ? "text-success" : h === "Warning" ? "text-gold" : "text-destructive")} />
                    <div className="leading-tight"><p className="text-[11px] text-muted-foreground">{l}</p><p className="text-xs font-semibold">{h}</p></div>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
