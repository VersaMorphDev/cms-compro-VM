import { getServicesBundle } from "@/features/services-solutions/queries";
import ServicesManagerClient from "@/features/services-solutions/components/ServicesManagerClient";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const bundle = await getServicesBundle();

  return (
    <ServicesManagerClient
      initialServices={bundle.services}
      initialSolutions={bundle.solutions}
      initialApproachSteps={bundle.approachSteps}
      initialWhyChooseUs={bundle.whyChooseUs}
      storageMode={bundle.storageMode}
    />
  );
}
