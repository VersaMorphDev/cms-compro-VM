import { getCalculatorConfigs } from "@/features/pricing-calculator/queries";
import CalculatorManagerClient from "@/features/pricing-calculator/components/CalculatorManagerClient";

export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const { items, storageMode } = await getCalculatorConfigs();

  return (
    <CalculatorManagerClient
      initialConfigs={items}
      storageMode={storageMode}
    />
  );
}
