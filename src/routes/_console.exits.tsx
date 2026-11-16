import { createFileRoute } from "@tanstack/react-router";
import { TransactionsPage } from "@/components/plpa/transactions";

export const Route = createFileRoute("/_console/exits")({
  head: () => ({ meta: [{ title: "Exit Transactions · PLPA" }, { name: "description", content: "Completed vehicle visits with total dwell time." }, { property: "og:title", content: "Exit Transactions · PLPA" }, { property: "og:description", content: "Completed vehicle visits with dwell time." }] }),
  component: () => <TransactionsPage kind="exit" />,
});
