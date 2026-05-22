import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const eventId = params.id;

    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("events")
      .doc(eventId)
      .update(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update finance event error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eventId = params.id;

    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("events")
      .doc(eventId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete finance event error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
