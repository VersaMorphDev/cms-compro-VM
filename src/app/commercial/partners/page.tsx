import { getPartners } from "@/features/partners/queries";
import PartnersManagerClient from "@/features/partners/components/PartnersManagerClient";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const { items, storageMode } = await getPartners();

  return (
    <PartnersManagerClient
      initialPartners={items}
      storageMode={storageMode}
    />
  );
}
