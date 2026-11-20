import { getJobApplicants } from "@/features/crm-inbound/queries";
import ApplicantsManagerClient from "@/features/crm-inbound/components/ApplicantsManagerClient";

export const dynamic = "force-dynamic";

export default async function CrmApplicantsPage() {
  const { items, storageMode } = await getJobApplicants();

  return (
    <ApplicantsManagerClient
      initialApplicants={items}
      storageMode={storageMode}
    />
  );
}
