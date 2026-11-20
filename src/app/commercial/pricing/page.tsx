import { getPricingTiers } from "@/features/pricing-calculator/queries";
import PricingManagerClient from "@/features/pricing-calculator/components/PricingManagerClient";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const { items, storageMode } = await getPricingTiers();

  return <PricingManagerClient initialTiers={items} storageMode={storageMode} />;
}
