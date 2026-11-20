import { getAffiliatesBundle } from "@/features/crm-inbound/queries";
import AffiliatesManagerClient from "@/features/crm-inbound/components/AffiliatesManagerClient";

export const dynamic = "force-dynamic";

export default async function CrmAffiliatesPage() {
  const { affiliates, referrals, storageMode } = await getAffiliatesBundle();

  return (
    <AffiliatesManagerClient
      initialAffiliates={affiliates}
      initialReferrals={referrals}
      storageMode={storageMode}
    />
  );
}
