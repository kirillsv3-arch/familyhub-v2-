import { adminAuth, adminDb } from "./firebase-admin";
import { cookies } from "next/headers";
import { User, Family } from "@/types";

export async function verifyToken() {
  const sessionCookie = cookies().get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error("verifyToken error:", error);
    return null;
  }
}

/**
 * Helper to serialize Firestore data by converting Timestamps to ISO strings.
 * We use unknown then cast to handle the recursive nature without using 'any'.
 */
function serializeData<T>(data: unknown): T {
  if (!data || typeof data !== 'object') return data as T;

  const serialized = { ...(data as Record<string, unknown>) };

  for (const key in serialized) {
    const value = serialized[key];
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
      serialized[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      serialized[key] = serializeData(value);
    }
  }

  return serialized as T;
}

export async function getUserWithFamily() {
  const decodedClaims = await verifyToken();

  if (!decodedClaims) {
    return { user: null, family: null };
  }

  const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();

  if (!userDoc.exists) {
    return { user: null, family: null };
  }

  const userData = serializeData<User>({
    ...userDoc.data(),
    uid: userDoc.id,
  });

  let familyData: Family | null = null;
  if (userData.familyId) {
    const familyDoc = await adminDb.collection("families").doc(userData.familyId).get();
    if (familyDoc.exists) {
      familyData = serializeData<Family>({
        ...familyDoc.data(),
        id: familyDoc.id,
      });
    }
  }

  return { user: userData, family: familyData };
}
