import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Detail, Reg, StatusBadge } from "@/components/plpa/ui";
import { dwellMinutes, dwellStatus, vehicles, visits, type Visit } from "@/lib/mock-data";
import { fmtDateTime, fmtDuration } from "@/lib/format";

/** Visit detail + full visit history for the vehicle. */
export function VisitDialog({ visit, onClose }: { visit: Visit | null; onClose: () => void }) {
  const vehicle = visit && vehicles.find((v) => v.id === visit.vehicleId);
  const history = visit ? visits.filter((v) => v.vehicleId === visit.vehicleId) : [];
  return (
    <Dialog open={!!visit} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {visit && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-display text-primary">
                <Reg>{visit.reg}</Reg> Visit {visit.id}
              </DialogTitle>
            </DialogHeader>
            <Detail
              items={[
                ["RFID Tag", <span className="font-mono text-xs">{visit.rfid}</span>],
                ["Vehicle type", visit.type],
                ["Owner / company", vehicle?.owner],
                ["Driver", vehicle?.driver],
                ["Entry gate", visit.entryGate],
                ["Exit gate", visit.exitGate ?? "Inside port"],
                ["Entry time", fmtDateTime(visit.entryTime)],
                ["Exit time", fmtDateTime(visit.exitTime)],
                ["Dwell time", fmtDuration(dwellMinutes(visit))],
                ["Dwell status", <StatusBadge status={dwellStatus(dwellMinutes(visit))} />],
                ["RFID read", <StatusBadge status={visit.readStatus} />],
                ["Transaction", <StatusBadge status={visit.txStatus} />],
              ]}
            />
            <h3 className="mt-4 text-sm font-semibold text-primary">Visit history ({history.length})</h3>
            <div className="max-h-56 overflow-y-auto rounded-sm border">
              <table className="w-full text-xs">
                <thead className="bg-secondary text-left text-primary"><tr><th className="p-2">Visit</th><th className="p-2">Entry</th><th className="p-2">Exit</th><th className="p-2">Dwell</th></tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t"><td className="p-2 font-mono">{h.id}</td><td className="p-2">{fmtDateTime(h.entryTime)}</td><td className="p-2">{h.exitTime ? fmtDateTime(h.exitTime) : <StatusBadge status="Inside Port" />}</td><td className="p-2">{fmtDuration(dwellMinutes(h))}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
