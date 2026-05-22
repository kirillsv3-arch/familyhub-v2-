import { getUserWithFamily } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import WishlistClient from "./WishlistClient";

export default async function WishlistPage() {
  const { user, family } = await getUserWithFamily();

  if (!user || !user.familyId || !family) {
    redirect("/auth");
  }

  // Get all family members names
  const membersSnapshot = await adminDb
    .collection("users")
    .where("familyId", "==", user.familyId)
    .get();

  const members = membersSnapshot.docs.map(doc => ({
    uid: doc.id,
    name: doc.data().name,
  }));

  return (
    <WishlistClient
      currentUser={user}
      members={members}
    />
  );
}
