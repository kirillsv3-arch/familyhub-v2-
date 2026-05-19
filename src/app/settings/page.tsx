import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { user, family } = await getUserWithFamily();

  if (!user) {
    redirect("/auth");
  }

  return <SettingsClient user={user} family={family} />;
}
