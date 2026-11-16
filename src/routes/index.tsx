import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Emblem, inputCls } from "@/components/plpa/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · PLPA RFID Vehicle Tracking" },
      { name: "description", content: "Secure sign-in to the Pakistan Land Port Authority RFID vehicle entry/exit and dwell-time tracking console." },
      { property: "og:title", content: "PLPA RFID Vehicle Entry/Exit & Dwell-Time Tracking" },
      { property: "og:description", content: "Secure console for Pakistan Land Port Authority vehicle movement tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("javed.dost@plpa.gov.pk");
  const [pw, setPw] = useState("");
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--gold) 0 1px, transparent 1px 22px)" }} />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-md border border-gold/40 shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between border-r border-gold/30 p-10 text-sidebar-foreground md:flex">
          <div>
            <Emblem className="size-24" />
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Pakistan Land Port Authority</p>
            <h1 className="mt-3 font-display text-3xl leading-snug text-primary-foreground">RFID Vehicle Entry/Exit &amp; Dwell-Time Tracking System</h1>
          </div>
          <ul className="space-y-2 text-sm text-sidebar-foreground/80">
            <li className="flex gap-2"><ShieldCheck className="size-4 text-gold" /> Automated RFID gate identification</li>
            <li className="flex gap-2"><ShieldCheck className="size-4 text-gold" /> Real-time dwell-time monitoring</li>
            <li className="flex gap-2"><ShieldCheck className="size-4 text-gold" /> Audited, role-based access</li>
          </ul>
        </div>
        <form
          className="bg-card p-8 md:p-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (!user || !pw) return toast.error("Enter your username and password.");
            navigate({ to: "/dashboard" });
          }}
        >
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <Emblem className="size-12" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Pakistan Land Port Authority</p>
              <p className="font-display text-sm text-primary">RFID Vehicle Tracking</p>
            </div>
          </div>
          <h2 className="font-display text-2xl text-primary">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Authorised personnel only.</p>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">Username or email
              <span className="relative"><User className="absolute left-2.5 top-2.5 size-4" /><input value={user} onChange={(e) => setUser(e.target.value)} className={`${inputCls} w-full pl-8`} /></span>
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">Password
              <span className="relative"><Lock className="absolute left-2.5 top-2.5 size-4" /><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className={`${inputCls} w-full pl-8`} /></span>
            </label>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" className="accent-[var(--primary)]" defaultChecked /> Remember me</label>
              <button type="button" onClick={() => toast.info("Password reset requests go to your system administrator (demo).")} className="font-medium text-primary hover:text-gold">Forgot password?</button>
            </div>
            <Button type="submit" className="mt-2 h-10">Sign in</Button>
            <p className="rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-[11px] text-gold-foreground">Demo build: any password signs you in. No real authentication is connected.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
