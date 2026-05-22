import { adminAuth, adminDb } from "./firebase-admin";
import { cookies } from "next/headers";
import { User, Family } from "@/types";
import * as admin from "firebase-admin";

/**
 * Utility to serialize Firestore data for Next.js Client Components.
 * Converts Timestamps to ISO strings.
 */
function serializeData<T>(data: unknown): T {
  if (!data || typeof data !== "object") return data as T;

  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  const serialized = { ...(data as Record<string, unknown>) };

  Object.keys(serialized).forEach((key) => {
    const value = serialized[key];
    if (value && typeof value === "object") {
      const potentialTimestamp = value as { toDate?: () => Date };
      if (typeof potentialTimestamp.toDate === "function") {
        serialized[key] = potentialTimestamp.toDate().toISOString();
      } else {
        serialized[key] = serializeData(value);
      }
    }
  });

  return serialized as T;
}

export async function verifyToken(): Promise<admin.auth.DecodedIdToken | null> {
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

export async function getUserWithFamily(): Promise<{ user: User | null; family: Family | null }> {
  const decodedClaims = await verifyToken();

  if (!decodedClaims) {
    return { user: null, family: null };
  }

  const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();

  if (!userDoc.exists) {
    console.error(`User document not found for uid: ${decodedClaims.uid}`);
    return { user: null, family: null };
  }

  const data = userDoc.data();
  if (!data) return { user: null, family: null };

  const userData = serializeData<User>({
    uid: userDoc.id,
    ...data,
  });

  let familyData: Family | null = null;
  if (userData.familyId) {
    const familyDoc = await adminDb.collection("families").doc(userData.familyId).get();
    if (familyDoc.exists) {
      const fData = familyDoc.data();
      if (fData) {
        familyData = serializeData<Family>({
          id: familyDoc.id,
          ...fData,
        });
      }
    } else {
      console.error(`Family document not found for familyId: ${userData.familyId}`);
    }
  } else {
    console.warn(`User ${userData.uid} has no familyId`);
  }

  return { user: userData, family: familyData };
}
