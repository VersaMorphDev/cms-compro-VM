import { getJobOpenings } from "@/features/careers/queries";
import CareersManagerClient from "@/features/careers/components/CareersManagerClient";

export const dynamic = "force-dynamic";

export default async function CompanyCareersPage() {
  const { items, storageMode } = await getJobOpenings();

  return (
    <CareersManagerClient initialJobs={items} storageMode={storageMode} />
  );
}
