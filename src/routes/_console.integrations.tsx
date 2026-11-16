import { createFileRoute } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoNotice, PageHeader, Panel, StatusBadge } from "@/components/plpa/ui";
import { integrations } from "@/lib/mock-data";

export const Route = createFileRoute("/_console/integrations")({
  head: () => ({ meta: [{ title: "External System Integration · PLPA" }, { name: "description", content: "Planned integrations with customs and government systems." }, { property: "og:title", content: "External System Integration · PLPA" }, { property: "og:description", content: "Planned external integrations." }] }),
  component: Integrations,
});

function Integrations() {
  return (
    <>
      <PageHeader title="External System Integration" description="Interfaces for exchanging vehicle movement data with other systems. None are connected yet." />
      <DemoNotice />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => (
          <Panel key={i.name}>
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-sm bg-primary/10 text-primary"><Network className="size-4" /></span>
              <StatusBadge status={i.status} />
            </div>
            <h3 className="mt-3 font-semibold text-primary">{i.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{i.desc}</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => toast.info("Integration requires backend API credentials — not available in this demo.")}>Configure</Button>
          </Panel>
        ))}
      </div>
    </>
  );
}
