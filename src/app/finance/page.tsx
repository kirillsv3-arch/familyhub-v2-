import { adminDb } from "@/lib/firebase-admin";
import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import FinanceClient from "./FinanceClient";
import { FinanceEvent, FinanceHistory, SavingGoal } from "@/types";

export default async function FinancePage() {
  const { user, family } = await getUserWithFamily();

  if (!user || !user.familyId || !family) {
    redirect("/auth");
  }

  // Fetch events
  const eventsSnapshot = await adminDb
    .collection("families")
    .doc(user.familyId)
    .collection("finance")
    .doc("data")
    .collection("events")
    .get();

  const events = eventsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
  })) as unknown as FinanceEvent[];

  // Fetch history (last 30 days for stats/calculation)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const historySnapshot = await adminDb
    .collection("families")
    .doc(user.familyId)
    .collection("finance")
    .doc("data")
    .collection("history")
    .where("date", ">=", thirtyDaysAgo)
    .orderBy("date", "desc")
    .get();

  const history = historySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.date?.toDate()?.toISOString() || new Date().toISOString(),
      createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    };
  }) as unknown as FinanceHistory[];

  // Fetch savings
  const savingsSnapshot = await adminDb
    .collection("families")
    .doc(user.familyId)
    .collection("finance")
    .doc("data")
    .collection("savings")
    .where("isArchived", "==", false)
    .get();

  const savings = savingsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
  })) as unknown as SavingGoal[];

  // Fetch family members
  const membersSnapshot = await adminDb
    .collection("users")
    .where("familyId", "==", user.familyId)
    .get();

  const members = membersSnapshot.docs.map(doc => ({
    uid: doc.id,
    name: doc.data().name
  }));

  return (
    <FinanceClient
      initialEvents={events}
      initialHistory={history}
      initialSavings={savings}
      currentUser={user}
      members={members}
    />
  );
}
