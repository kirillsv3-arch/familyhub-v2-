import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-server";

export async function PATCH(request: Request) {
  const decodedToken = await verifyToken();
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = decodedToken.uid;
  const updates = await request.json();

  try {
    const allowedFields = ['name', 'caloriesGoal', 'proteinsGoal', 'fatsGoal', 'carbsGoal', 'goalType', 'fcmToken'];
    const filteredUpdates: Record<string, string | number> = {};

    for (const key of allowedFields) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }

    await adminDb.collection("users").doc(uid).update(filteredUpdates);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Keep POST for compatibility if I used it in messaging/index.ts
export async function POST(request: Request) {
    return PATCH(request);
}
