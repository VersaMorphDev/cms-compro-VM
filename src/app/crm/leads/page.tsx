import { getLeads } from "@/features/crm-inbound/queries";
import LeadsInboxClient from "@/features/crm-inbound/components/LeadsInboxClient";

export const dynamic = "force-dynamic";

export default async function CrmLeadsPage() {
  const { items, storageMode } = await getLeads();

  return <LeadsInboxClient initialLeads={items} storageMode={storageMode} />;
}
