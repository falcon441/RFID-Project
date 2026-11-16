import { createFileRoute } from "@tanstack/react-router";
import { TransactionsPage } from "@/components/plpa/transactions";

export const Route = createFileRoute("/_console/entries")({
  head: () => ({ meta: [{ title: "Entry Transactions · PLPA" }, { name: "description", content: "RFID entry transactions recorded at PLPA entry lanes." }, { property: "og:title", content: "Entry Transactions · PLPA" }, { property: "og:description", content: "RFID entry transactions." }] }),
  component: () => <TransactionsPage kind="entry" />,
});
