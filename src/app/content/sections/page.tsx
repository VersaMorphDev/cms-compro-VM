import { getPageSections } from "@/features/page-sections/queries";
import PageSectionsClient from "./PageSectionsClient";

export const dynamic = "force-dynamic";

export default async function PageSectionsPage() {
  const { items, storageMode } = await getPageSections();

  return (
    <PageSectionsClient initialSections={items} storageMode={storageMode} />
  );
}
