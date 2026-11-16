import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, FlaskConical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Emblem({ className }: { className?: string }) {
  // Placeholder emblem until the official PLPA logo file is supplied.
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="PLPA emblem">
      <circle cx="32" cy="32" r="30" fill="var(--primary)" stroke="var(--gold)" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="var(--gold-soft)" strokeWidth="0.8" strokeDasharray="2 2" />
      <path d="M38 17a14 14 0 1 0 6 21 11 11 0 1 1-6-21z" fill="var(--gold)" />
      <path d="M41 22l1.6 3.4 3.7.4-2.8 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.8-2.5 3.7-.4z" fill="var(--gold-soft)" />
      <text x="32" y="52" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--gold-soft)" fontFamily="serif">PLPA</text>
    </svg>
  );
}

const tone: Record<string, string> = {
  green: "bg-success/12 text-success border-success/30",
  gold: "bg-gold/15 text-gold-foreground border-gold/50",
  red: "bg-destructive/10 text-destructive border-destructive/30",
  muted: "bg-muted text-muted-foreground border-border",
  brand: "bg-primary/10 text-primary border-primary/25",
};
const statusTone: Record<string, keyof typeof tone> = {
  Normal: "green", Online: "green", Active: "green", Completed: "green", "Read OK": "green", Resolved: "green", Connected: "green", Low: "muted",
  Warning: "gold", "Weak Signal": "gold", Acknowledged: "gold", Medium: "gold", Inactive: "muted", Planned: "muted",
  Excessive: "red", "Excessive Dwell Time": "red", Offline: "red", Blocked: "red", Blacklisted: "red", Flagged: "red", Critical: "red", High: "red", "Manual Override": "gold",
  "Inside Port": "brand", Open: "brand",
};
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const t = tone[statusTone[status] ?? "muted"];
  const dot = statusTone[status] === "green" || statusTone[status] === "red" || statusTone[status] === "gold";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", t, className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {status === "Excessive" ? "Excessive Dwell" : status}
    </span>
  );
}

export function Panel({ title, action, children, className, bodyClass }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("rounded-md border bg-card shadow-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="h-4 w-0.5 bg-gold" />
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={cn("p-4", bodyClass)}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function DemoNotice() {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-gold-foreground">
      <FlaskConical className="size-4 shrink-0 text-gold" />
      <span>
        <b>Simulated demo data.</b> No RFID readers or backend are connected. Values are generated samples for demonstration only.
      </span>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, tone: t = "brand" }: { icon: LucideIcon; label: string; value: ReactNode; trend?: string; tone?: "brand" | "gold" | "red" }) {
  return (
    <div className="relative overflow-hidden rounded-md border bg-card p-4 shadow-card">
      <div className={cn("absolute inset-x-0 top-0 h-0.5", t === "red" ? "bg-destructive" : t === "gold" ? "bg-gold" : "bg-primary")} />
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={cn("grid size-8 place-items-center rounded-sm", t === "red" ? "bg-destructive/10 text-destructive" : t === "gold" ? "bg-gold/15 text-gold" : "bg-primary/10 text-primary")}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl text-foreground tabular-nums">{value}</p>
      {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
    </div>
  );
}

export const inputCls =
  "h-9 rounded-sm border border-input bg-card px-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-ring/30";

export function FilterSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: readonly string[]; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">All {label}</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sort?: (row: T) => number | string;
  className?: string;
}

export function DataTable<T>({ rows, columns, pageSize = 12, onRowClick, rowKey, empty = "No records match your filters." }: { rows: T[]; columns: Column<T>[]; pageSize?: number; onRowClick?: (r: T) => void; rowKey: (r: T) => string; empty?: string }) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key);
    if (!col?.sort || !sort) return rows;
    return [...rows].sort((a, b) => {
      const x = col.sort!(a), y = col.sort!(b);
      return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
    });
  }, [rows, sort, columns]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const p = Math.min(page, pages - 1);
  const slice = sorted.slice(p * pageSize, p * pageSize + pageSize);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/60 text-left">
              {columns.map((c) => (
                <th key={c.key} className={cn("whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary", c.className)}>
                  {c.sort ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-gold"
                      onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: -1 }))}
                    >
                      {c.header}
                      {sort?.key === c.key ? sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cn("border-b last:border-0 hover:bg-muted/60", onRowClick && "cursor-pointer")}>
                {columns.map((c) => (
                  <td key={c.key} className={cn("whitespace-nowrap px-3 py-2.5", c.className)}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
            {!slice.length && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span>
            {p * pageSize + 1}–{Math.min(sorted.length, (p + 1) * pageSize)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button aria-label="Previous page" disabled={p === 0} onClick={() => setPage(p - 1)} className="grid size-7 place-items-center rounded-sm border bg-card disabled:opacity-40">
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2">Page {p + 1} / {pages}</span>
            <button aria-label="Next page" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} className="grid size-7 place-items-center rounded-sm border bg-card disabled:opacity-40">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs text-foreground/80">{children}</span>;
}
export function Reg({ children }: { children: ReactNode }) {
  return <span className="rounded-sm border border-primary/20 bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">{children}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      {children}
    </label>
  );
}

export function Detail({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
