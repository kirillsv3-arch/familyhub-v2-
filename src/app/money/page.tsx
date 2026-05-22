import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import MoneyPage from "./MoneyClient";

export default async function Page() {
  const { user } = await getUserWithFamily();

  if (!user) {
    redirect("/auth");
  }

  if (!user.familyId) {
    redirect("/family-setup");
  }

  return <MoneyPage familyId={user.familyId} />;
}
