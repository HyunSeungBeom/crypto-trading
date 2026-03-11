import { fetchAlerts } from "@/features/alert/api/alertActions";
import { AlertsView } from "@/features/alert";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  let alerts = null;
  try {
    alerts = await fetchAlerts();
  } catch {
    // DB 연결 실패 등 — 클라이언트에서 재시도
  }

  return <AlertsView initialData={alerts ?? undefined} />;
}
