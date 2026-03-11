import { fetchAlerts } from "@/features/alert/api/alertActions";
import { AlertsView } from "@/features/alert";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await fetchAlerts();

  return <AlertsView initialData={alerts} />;
}
