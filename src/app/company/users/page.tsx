import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getAdminUsers } from "@/features/users/queries";
import UsersManagerClient from "./UsersManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=/company/users");
  }

  const users = await getAdminUsers();

  return (
    <UsersManagerClient
      initialUsers={users}
      currentUser={session}
    />
  );
}
