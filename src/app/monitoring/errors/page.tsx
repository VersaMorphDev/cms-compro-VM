import {
  getActivityLogs,
  getMonitoringSummary,
  getSystemErrorLogs,
} from "@/features/monitoring/queries";
import ErrorMonitorClient from "@/features/monitoring/components/ErrorMonitorClient";

export const dynamic = "force-dynamic";

export default async function MonitoringErrorsPage() {
  const [errorsRes, activitiesRes] = await Promise.all([
    getSystemErrorLogs(50),
    getActivityLogs(50),
  ]);

  const summary = getMonitoringSummary(
    activitiesRes.items,
    errorsRes.items,
    errorsRes.storageMode
  );

  return (
    <ErrorMonitorClient
      initialErrors={errorsRes.items}
      summary={summary}
    />
  );
}
