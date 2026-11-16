import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DemoNotice, Field, PageHeader, Panel, inputCls } from "@/components/plpa/ui";

export const Route = createFileRoute("/_console/settings")({
  head: () => ({ meta: [{ title: "System Settings · PLPA" }, { name: "description", content: "Dwell-time thresholds, notifications and system preferences." }, { property: "og:title", content: "System Settings · PLPA" }, { property: "og:description", content: "System preferences." }] }),
  component: Settings,
});

function Settings() {
  return (
    <>
      <PageHeader title="System Settings" description="Configuration values (not saved in this demo)." actions={<Button onClick={() => toast.success("Settings saved (demo only)")}>Save changes</Button>} />
      <DemoNotice />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Dwell-time thresholds">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Warning after (hours)"><input type="number" defaultValue={6} className={inputCls} /></Field>
            <Field label="Permitted limit (hours)"><input type="number" defaultValue={8} className={inputCls} /></Field>
          </div>
        </Panel>
        <Panel title="RFID read rules">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duplicate read window (sec)"><input type="number" defaultValue={30} className={inputCls} /></Field>
            <Field label="Min. RSSI (dBm)"><input type="number" defaultValue={-70} className={inputCls} /></Field>
          </div>
        </Panel>
        <Panel title="Notifications">
          {["Email critical alerts to supervisors", "SMS on reader offline", "Daily summary report at 08:00 PKT"].map((l, i) => (
            <label key={l} className="flex items-center justify-between border-b py-2.5 text-sm last:border-0">{l}<Switch defaultChecked={i !== 1} /></label>
          ))}
        </Panel>
        <Panel title="General">
          <div className="grid gap-3">
            <Field label="Port name"><input defaultValue="Torkham & Chaman Land Ports" className={inputCls} /></Field>
            <Field label="Time zone"><select className={inputCls} defaultValue="Asia/Karachi"><option>Asia/Karachi</option></select></Field>
            <Field label="Backend API base URL"><input placeholder="https://api.plpa.gov.pk (not connected)" className={inputCls} /></Field>
          </div>
        </Panel>
      </div>
    </>
  );
}
