import { getTeamAndSettings } from "@/features/company-profile/queries";
import TeamAndAboutClient from "@/features/company-profile/components/TeamAndAboutClient";

export const dynamic = "force-dynamic";

export default async function CompanyTeamPage() {
  const data = await getTeamAndSettings();

  return (
    <TeamAndAboutClient
      initialTeam={data.teamMembers}
      initialProfile={data.companyProfile}
      initialStats={data.aboutStats}
      initialValues={data.aboutValues}
      storageMode={data.storageMode}
    />
  );
}
