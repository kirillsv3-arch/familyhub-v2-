import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { FinanceEvent } from "@/types";

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get last 4 weeks of completed purchases
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const purchasesSnapshot = await adminDb
    .collection(`families/${user.familyId}/finance/data/events`)
    .where("type", "==", "purchase")
    .where("isCompleted", "==", true)
    .where("createdAt", ">=", fourWeeksAgo)
    .get();

  const purchases = purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Calculate stats by week
  const stats = [0, 0, 0, 0]; // 4 weeks
  const now = new Date();

  purchases.forEach((p: Partial<FinanceEvent>) => {
    const createdAt = p.createdAt as unknown as { toDate?: () => Date } | string;
    const date = (typeof createdAt === 'object' && createdAt.toDate) ? createdAt.toDate() : new Date(createdAt as string);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffInDays / 7);
    if (weekIndex < 4) {
      stats[3 - weekIndex] += p.completedAmount || 0;
    }
  });

  const totalSpent = stats.reduce((a, b) => a + b, 0);
  const average = totalSpent / 4;

  return NextResponse.json({
    weeklyStats: stats,
    averageMonthly: totalSpent,
    averageWeekly: average
  });
}
