/**
 * SIMULATED DEMO DATA — no RFID hardware or backend is connected.
 * Replace the exports here with API calls (see src/lib/api.ts) once a backend exists.
 */

let seed = 20261105;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

/** Fixed reference "now" so server and browser render identical demo data. */
export const REF_NOW = new Date("2026-11-05T07:00:00Z").getTime();
export const PERMITTED_DWELL_MIN = 480; // 8 hours
export const WARNING_DWELL_MIN = 360; // 6 hours

export const VEHICLE_TYPES = [
  "Container Truck",
  "Cargo Truck",
  "Tanker",
  "Trailer",
  "Car",
  "Bus",
  "Other",
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const ENTRY_GATES = ["Gate E-1 (Torkham)", "Gate E-2 (Torkham)", "Gate E-3 (Chaman)"];
export const EXIT_GATES = ["Gate X-1 (Torkham)", "Gate X-2 (Chaman)"];

const prefixes = ["LES", "KHI", "PSH", "QTA", "ISB", "RWP", "MLN", "AFG-KBL", "AFG-JLB"];
const companies = [
  "Al-Noor Logistics",
  "Khyber Freight Co.",
  "National Logistics Cell",
  "Indus Haulage",
  "Bolan Transport",
  "Silk Route Carriers",
  "Afghan Transit Ltd.",
  "Pak-Afghan Cargo",
];
const drivers = [
  "Muhammad Asif",
  "Gul Khan",
  "Imran Shah",
  "Abdul Wahab",
  "Zahid Hussain",
  "Naveed Akhtar",
  "Sher Ali",
  "Rahmatullah",
  "Bilal Ahmed",
  "Faisal Mehmood",
];

export type DwellStatus = "Normal" | "Warning" | "Excessive";

export interface Vehicle {
  id: string;
  reg: string;
  type: VehicleType;
  rfid: string;
  owner: string;
  driver: string;
  contact: string;
  status: "Active" | "Inactive" | "Blacklisted";
}

export interface Visit {
  id: string;
  vehicleId: string;
  reg: string;
  rfid: string;
  type: VehicleType;
  entryGate: string;
  exitGate?: string;
  entryTime: number;
  exitTime?: number;
  readStatus: "Read OK" | "Weak Signal" | "Manual Override";
  txStatus: "Completed" | "Open" | "Flagged";
}

const typeWeights: VehicleType[] = [
  "Container Truck", "Container Truck", "Container Truck", "Cargo Truck", "Cargo Truck",
  "Tanker", "Trailer", "Trailer", "Car", "Bus", "Other",
];

export const vehicles: Vehicle[] = Array.from({ length: 140 }, (_, i) => {
  const p = pick(prefixes);
  return {
    id: `V${String(i + 1).padStart(4, "0")}`,
    reg: `${p}-${int(100, 9999)}`,
    type: pick(typeWeights),
    rfid: `E200-${(0x3a10 + i * 7).toString(16).toUpperCase()}-${int(1000, 9999)}`,
    owner: pick(companies),
    driver: pick(drivers),
    contact: `+92 3${int(0, 4)}${int(0, 9)} ${int(1000000, 9999999)}`,
    status: i % 23 === 0 ? "Inactive" : i % 61 === 0 ? "Blacklisted" : "Active",
  };
});

const visitsTmp: Visit[] = [];
let vc = 1;
for (let d = 13; d >= 0; d--) {
  const count = int(55, 95);
  for (let k = 0; k < count; k++) {
    const v = pick(vehicles);
    const entryTime = REF_NOW - d * 86400000 - int(0, 86400000 - 1);
    const dwellMin = rnd() < 0.12 ? int(480, 1500) : int(35, 470);
    const exitTime = entryTime + dwellMin * 60000;
    const open = exitTime > REF_NOW || (d === 0 && rnd() < 0.35) || (d <= 1 && rnd() < 0.06);
    visitsTmp.push({
      id: `TX-${String(vc++).padStart(6, "0")}`,
      vehicleId: v.id,
      reg: v.reg,
      rfid: v.rfid,
      type: v.type,
      entryGate: pick(ENTRY_GATES),
      exitGate: open ? undefined : pick(EXIT_GATES),
      entryTime,
      exitTime: open ? undefined : exitTime,
      readStatus: rnd() < 0.9 ? "Read OK" : rnd() < 0.6 ? "Weak Signal" : "Manual Override",
      txStatus: open ? "Open" : rnd() < 0.05 ? "Flagged" : "Completed",
    });
  }
}
export const visits = visitsTmp.sort((a, b) => b.entryTime - a.entryTime);

export const dwellMinutes = (v: Visit) => Math.round(((v.exitTime ?? REF_NOW) - v.entryTime) / 60000);
export const dwellStatus = (min: number): DwellStatus =>
  min >= PERMITTED_DWELL_MIN ? "Excessive" : min >= WARNING_DWELL_MIN ? "Warning" : "Normal";

export const openVisits = visits.filter((v) => !v.exitTime);
export const exits = visits
  .filter((v) => v.exitTime)
  .sort((a, b) => (b.exitTime ?? 0) - (a.exitTime ?? 0));

const dayStart = (t: number) => {
  const d = new Date(t + 5 * 3600000); // PKT
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() - 5 * 3600000;
};
const today = dayStart(REF_NOW);
export const todaysEntries = visits.filter((v) => v.entryTime >= today);
export const todaysExits = exits.filter((v) => (v.exitTime ?? 0) >= today);

export const dailySeries = Array.from({ length: 14 }, (_, i) => {
  const start = today - (13 - i) * 86400000;
  const end = start + 86400000;
  const done = exits.filter((v) => v.entryTime >= start && v.entryTime < end);
  return {
    day: new Date(start + 5 * 3600000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }),
    entries: visits.filter((v) => v.entryTime >= start && v.entryTime < end).length,
    exits: exits.filter((v) => (v.exitTime ?? 0) >= start && (v.exitTime ?? 0) < end).length,
    avgDwell: done.length ? Math.round(done.reduce((s, v) => s + dwellMinutes(v), 0) / done.length) : 0,
  };
});

export const typeDistribution = VEHICLE_TYPES.map((t) => ({
  name: t,
  value: openVisits.filter((v) => v.type === t).length,
}));

export interface Gate {
  id: string;
  name: string;
  number: string;
  type: "Entry" | "Exit";
  reader: Health;
  antenna: Health;
  radar: Health;
  network: Health;
  lastComm: number;
}
export type Health = "Online" | "Offline" | "Warning";
export const gates: Gate[] = [
  { id: "g1", name: "Torkham Entry Lane 1", number: "E-1", type: "Entry", reader: "Online", antenna: "Online", radar: "Online", network: "Online", lastComm: REF_NOW - 8000 },
  { id: "g2", name: "Torkham Entry Lane 2", number: "E-2", type: "Entry", reader: "Online", antenna: "Warning", radar: "Online", network: "Online", lastComm: REF_NOW - 21000 },
  { id: "g3", name: "Chaman Entry Lane 1", number: "E-3", type: "Entry", reader: "Offline", antenna: "Offline", radar: "Online", network: "Warning", lastComm: REF_NOW - 1860000 },
  { id: "g4", name: "Torkham Exit Lane 1", number: "X-1", type: "Exit", reader: "Online", antenna: "Online", radar: "Online", network: "Online", lastComm: REF_NOW - 5000 },
  { id: "g5", name: "Chaman Exit Lane 1", number: "X-2", type: "Exit", reader: "Online", antenna: "Online", radar: "Warning", network: "Online", lastComm: REF_NOW - 44000 },
];

export type Severity = "Critical" | "High" | "Medium" | "Low";
export interface Alert {
  id: string;
  type: string;
  severity: Severity;
  reg?: string;
  gate: string;
  time: number;
  description: string;
  status: "Open" | "Acknowledged" | "Resolved";
}
const alertTemplates: [string, Severity, string, boolean][] = [
  ["RFID tag not recognized", "High", "Tag read at lane does not match any registered vehicle.", false],
  ["Duplicate entry attempt", "High", "Vehicle already has an open visit; second entry blocked.", true],
  ["Exit without entry record", "Critical", "Exit detected with no matching entry transaction.", true],
  ["Excessive dwell time", "Medium", "Vehicle exceeded permitted dwell time of 8 hours.", true],
  ["RFID reader offline", "Critical", "Reader stopped responding to heartbeat checks.", false],
  ["Network connection failure", "High", "Lane controller lost connection to central server.", false],
  ["Weak tag signal", "Low", "Tag read with low RSSI; manual verification recommended.", true],
];
export const alerts: Alert[] = Array.from({ length: 42 }, (_, i) => {
  const [type, severity, description, hasVeh] = alertTemplates[i % alertTemplates.length];
  return {
    id: `AL-${String(1042 - i).padStart(5, "0")}`,
    type,
    severity,
    reg: hasVeh ? pick(vehicles).reg : undefined,
    gate: pick([...ENTRY_GATES, ...EXIT_GATES]),
    time: REF_NOW - i * int(900000, 5400000),
    description,
    status: i < 9 ? "Open" : i < 16 ? "Acknowledged" : "Resolved",
  };
});

export const ROLES = [
  "Super Administrator",
  "Administrator",
  "Supervisor",
  "Gate Operator",
  "Security Staff",
  "Report Viewer",
] as const;
export interface User {
  id: string;
  name: string;
  email: string;
  role: (typeof ROLES)[number];
  active: boolean;
  lastLogin: number;
}
const names = ["Javed Dost", "Ayesha Khan", "Usman Tariq", "Sana Malik", "Hamza Qureshi", "Fatima Noor", "Kamran Yousaf", "Rabia Iqbal", "Adnan Sheikh", "Mehwish Ali", "Tariq Jameel", "Nadia Hassan"];
export const users: User[] = names.map((n, i) => ({
  id: `U${i + 1}`,
  name: n,
  email: `${n.toLowerCase().replace(" ", ".")}@plpa.gov.pk`,
  role: ROLES[Math.min(i, i % ROLES.length)],
  active: i !== 9,
  lastLogin: REF_NOW - int(600000, 86400000 * 4),
}));

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  time: number;
  ip: string;
  description: string;
}
const auditActs: [string, string, string][] = [
  ["Login", "Authentication", "User signed in to the console"],
  ["Create", "Vehicle Management", "Registered new vehicle record"],
  ["Update", "RFID Tag Management", "Reassigned RFID tag to vehicle"],
  ["Acknowledge", "Alerts", "Acknowledged excessive dwell-time alert"],
  ["Export", "Reports", "Exported daily entry report (CSV)"],
  ["Update", "Gate Management", "Changed lane configuration"],
  ["Deactivate", "User Management", "Deactivated user account"],
  ["Override", "Entry Transactions", "Manual override for unreadable tag"],
];
export const auditLogs: AuditLog[] = Array.from({ length: 60 }, (_, i) => {
  const [action, module, description] = pick(auditActs);
  return {
    id: `AU-${9000 - i}`,
    user: pick(names.slice(0, 8)),
    action,
    module,
    time: REF_NOW - i * int(400000, 3600000),
    ip: `10.12.${int(1, 20)}.${int(2, 250)}`,
    description,
  };
});

export interface RfidTag {
  id: string;
  vehicle?: string;
  status: "Active" | "Inactive" | "Blocked";
  registered: number;
  lastSeen?: number;
  lanes: string;
}
export const rfidTags: RfidTag[] = vehicles.map((v, i) => {
  const last = visits.find((x) => x.rfid === v.rfid);
  return {
    id: v.rfid,
    vehicle: i % 31 === 7 ? undefined : v.reg,
    status: v.status === "Blacklisted" ? "Blocked" : v.status === "Inactive" ? "Inactive" : "Active",
    registered: REF_NOW - int(20, 700) * 86400000,
    lastSeen: last?.exitTime ?? last?.entryTime,
    lanes: i % 3 === 0 ? "All lanes" : i % 3 === 1 ? "Torkham E-1/E-2, X-1" : "Chaman E-3, X-2",
  };
});

export const integrations = [
  { name: "Pakistan Customs WeBOC", desc: "Share entry/exit events with customs declarations", status: "Planned" },
  { name: "Pakistan Single Window (PSW)", desc: "Trade document and vehicle manifest lookup", status: "Planned" },
  { name: "NADRA Driver Verification", desc: "CNIC verification for drivers at entry", status: "Planned" },
  { name: "Excise & Taxation Vehicle Registry", desc: "Validate registration numbers", status: "Planned" },
  { name: "SMS / Email Gateway", desc: "Notify supervisors of critical alerts", status: "Planned" },
];
