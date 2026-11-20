import { getProjects } from "@/features/portfolio/queries";
import PortfolioManagerClient from "@/features/portfolio/components/PortfolioManagerClient";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const { items, storageMode } = await getProjects();

  return (
    <PortfolioManagerClient
      initialProjects={items}
      storageMode={storageMode}
    />
  );
}
