import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { getUserWithFamily } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getUserWithFamily();

    // Support both direct user calls and potential background calls (via service worker/token)
    // For background calls from notification actions, we might need a different auth mechanism
    // or include familyId/eventId in the payload if the session cookie is available.

    const body = await req.json();
    const { eventId, familyId } = body;

    if (!eventId || !familyId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Security: if 'user' exists, check if they belong to the family
    if (user && user.familyId !== familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const eventRef = adminDb.collection(`families/${familyId}/finance/data/events`).doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventDoc.data();
    if (eventData?.type !== 'subscription') {
      return NextResponse.json({ error: "Event is not a subscription" }, { status: 400 });
    }

    // Deactivate subscription: set active to false and stop monthly repeats
    await eventRef.update({
      active: false,
      repeatMonthly: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
