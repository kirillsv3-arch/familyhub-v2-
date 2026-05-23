import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { FamilyEvent } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const familyDoc = await adminDb.collection("families").doc(user.familyId).get();
    const memberIds = familyDoc.data()?.memberIds || [];

    const memberEvents: FamilyEvent[] = [];
    for (const memberId of memberIds) {
      const memberDoc = await adminDb.collection("users").doc(memberId).get();
      const memberData = memberDoc.data();
      if (memberData?.birthDate) {
        memberEvents.push({
          id: `birthday-${memberId}`,
          title: `День рождения: ${memberData.name}`,
          date: memberData.birthDate,
          type: 'birthday',
          familyId: user.familyId,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
        });
      }
    }

    const snapshot = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("events")
      .orderBy("date", "asc")
      .get();

    const manualEvents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FamilyEvent[];

    return NextResponse.json([...memberEvents, ...manualEvents]);
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, date, type } = data;

    if (!title || !date || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newEvent = {
      title,
      date,
      type,
      isRecurring: !!data.isRecurring,
      familyId: user.familyId,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("events")
      .add(newEvent);

    return NextResponse.json({ id: docRef.id, ...newEvent });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
