import { getFaqItems } from "@/features/faq/queries";
import FaqManagerClient from "@/features/faq/components/FaqManagerClient";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const { items, storageMode } = await getFaqItems();

  return <FaqManagerClient initialFaqs={items} storageMode={storageMode} />;
}
