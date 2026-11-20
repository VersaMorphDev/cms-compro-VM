import { getTestimonials } from "@/features/company-profile/queries";
import TestimonialsManagerClient from "@/features/company-profile/components/TestimonialsManagerClient";

export const dynamic = "force-dynamic";

export default async function CompanyTestimonialsPage() {
  const { items, storageMode } = await getTestimonials();

  return (
    <TestimonialsManagerClient
      initialTestimonials={items}
      storageMode={storageMode}
    />
  );
}
