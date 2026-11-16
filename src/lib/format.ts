const tz = "Asia/Karachi";
export const fmtDateTime = (t?: number) =>
  t
    ? new Date(t).toLocaleString("en-GB", { timeZone: tz, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })
    : "—";
export const fmtDate = (t?: number) =>
  t ? new Date(t).toLocaleDateString("en-GB", { timeZone: tz, day: "2-digit", month: "short", year: "numeric" }) : "—";
export const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};
/** Date input (yyyy-mm-dd) to epoch ms at PKT midnight. */
export const pktDay = (s: string) => new Date(`${s}T00:00:00+05:00`).getTime();

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const head = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
