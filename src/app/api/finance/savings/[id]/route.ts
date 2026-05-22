import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const goalId = params.id;
    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("savings")
      .doc(goalId)
      .update({ isArchived: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete saving goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
    const goalId = params.id;

    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("finance")
      .doc("data")
      .collection("savings")
      .doc(goalId)
      .update(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update saving goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
