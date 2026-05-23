import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user } = await getUserWithFamily();
  if (!user || !user.familyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const data = await request.json();
    const updateData: Record<string, string | boolean | number | null | FieldValue> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    if (data.isCompleted !== undefined) {
      updateData.isCompleted = data.isCompleted;
      updateData.completedAt = data.isCompleted ? FieldValue.serverTimestamp() : null;
    }
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.isGeneral !== undefined) updateData.isGeneral = data.isGeneral;

    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("tasks")
      .doc(id)
      .update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update task error:", error);
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

  const { id } = params;

  try {
    await adminDb
      .collection("families")
      .doc(user.familyId)
      .collection("tasks")
      .doc(id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
