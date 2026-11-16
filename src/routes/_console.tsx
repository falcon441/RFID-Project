import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, ChevronsLeft, ChevronsRight, LogOut, Menu, Search, X } from "lucide-react";
import { NAV } from "@/components/plpa/nav";
import { Emblem } from "@/components/plpa/ui";
import { alerts } from "@/lib/mock-data";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_console")({ component: ConsoleLayout });

function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const groups = [...new Set(NAV.map((n) => n.group))];
  return (
    <div className="flex h-full flex-col bg-brand text-sidebar-foreground">
      <div className={cn("flex items-center gap-3 border-b border-sidebar-border px-4 py-4", collapsed && "justify-center px-2")}>
        <Emblem className="size-10 shrink-0" />
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-display text-sm text-gold-soft">PLPA</p>
            <p className="text-[11px] text-sidebar-foreground/75">RFID Vehicle Entry/Exit &amp; Dwell-Time</p>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((g) => (
          <div key={g} className="mb-3">
            {!collapsed && <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold/80">{g}</p>}
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = path === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={onNavigate}
                  title={collapsed ? n.title : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-sm border-l-2 border-transparent px-3 py-2 text-[13px] transition-colors hover:bg-sidebar-accent",
                    active && "border-gold bg-sidebar-accent font-semibold text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <n.icon className={cn("size-4 shrink-0", active ? "text-gold" : "text-sidebar-foreground/70")} />
                  {!collapsed && <span className="truncate">{n.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      {!collapsed && <p className="border-t border-sidebar-border px-4 py-3 text-[10px] text-sidebar-foreground/60">Pakistan Land Port Authority · Demo build</p>}
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return <span className="hidden text-xs tabular-nums text-muted-foreground lg:block">{now ? `${fmtDateTime(now)} PKT` : ""}</span>;
}

function ConsoleLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => n.to === path);
  const openAlerts = alerts.filter((a) => a.status === "Open");

  return (
    <div className="flex min-h-screen w-full">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 transition-[width] md:block", collapsed ? "w-16" : "w-64")}>
        <Sidebar collapsed={collapsed} />
      </aside>
      {mobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobile(false)} />
          <div className="absolute inset-y-0 left-0 w-72">
            <Sidebar collapsed={false} onNavigate={() => setMobile(false)} />
            <button aria-label="Close menu" onClick={() => setMobile(false)} className="absolute right-2 top-4 text-sidebar-foreground"><X className="size-5" /></button>
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur">
          <button aria-label="Open menu" className="md:hidden" onClick={() => setMobile(true)}><Menu className="size-5 text-primary" /></button>
          <button aria-label="Toggle sidebar" className="hidden text-primary hover:text-gold md:block" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <ChevronsRight className="size-5" /> : <ChevronsLeft className="size-5" />}
          </button>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">PLPA Console / {current?.group ?? "—"}</p>
            <p className="truncate text-sm font-semibold text-primary">{current?.title}</p>
          </div>
          <form
            className="relative ml-auto hidden w-72 sm:block"
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/live", search: { q } }); }}
          >
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search registration or RFID tag…" className="h-9 w-full rounded-sm border bg-background pl-8 pr-3 text-sm outline-none focus:border-gold" />
          </form>
          <Clock />
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Notifications" className="relative ml-auto rounded-sm p-2 text-primary hover:bg-muted sm:ml-0">
              <Bell className="size-5" />
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-gold-foreground">{openAlerts.length}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Open alerts (demo)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {openAlerts.slice(0, 5).map((a) => (
                <DropdownMenuItem key={a.id} onSelect={() => navigate({ to: "/alerts" })} className="flex-col items-start gap-0.5">
                  <span className="text-xs font-semibold">{a.type}</span>
                  <span className="text-[11px] text-muted-foreground">{a.gate} · {fmtDateTime(a.time)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-sm px-1 py-1 hover:bg-muted">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-gold-soft">JD</span>
              <span className="hidden text-left leading-tight lg:block">
                <span className="block text-xs font-semibold">Javed Dost</span>
                <span className="block text-[10px] text-muted-foreground">Super Administrator</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>System settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate({ to: "/" })}><LogOut className="size-4" /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
