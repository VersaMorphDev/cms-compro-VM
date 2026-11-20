import { getLegalPages } from "@/features/company-profile/queries";
import LegalPagesManagerClient from "@/features/company-profile/components/LegalPagesManagerClient";

export const dynamic = "force-dynamic";

export default async function CompanyLegalPage() {
  const { items, storageMode } = await getLegalPages();

  return (
    <LegalPagesManagerClient
      initialPages={items}
      storageMode={storageMode}
    />
  );
}
