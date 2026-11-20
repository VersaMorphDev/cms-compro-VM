import {
  getActivityLogs,
  getMonitoringSummary,
  getSystemErrorLogs,
} from "@/features/monitoring/queries";
import ActivityMonitorClient from "@/features/monitoring/components/ActivityMonitorClient";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const [activitiesRes, errorsRes] = await Promise.all([
    getActivityLogs(50),
    getSystemErrorLogs(50),
  ]);

  const summary = getMonitoringSummary(
    activitiesRes.items,
    errorsRes.items,
    activitiesRes.storageMode
  );

  return (
    <ActivityMonitorClient
      initialLogs={activitiesRes.items}
      summary={summary}
    />
  );
}
