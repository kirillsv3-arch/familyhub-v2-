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

export async function getUserWithFamily() {
  const decodedClaims = await verifyToken();

  if (!decodedClaims) {
    return { user: null, family: null };
  }

  const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();

  if (!userDoc.exists) {
    return { user: null, family: null };
  }

  const data = userDoc.data();
  if (!data) return { user: null, family: null };

  const userData = {
    uid: userDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
  } as any;

  let familyData: any = null;
  if (userData.familyId) {
    const familyDoc = await adminDb.collection("families").doc(userData.familyId).get();
    if (familyDoc.exists) {
      const fData = familyDoc.data();
      if (fData) {
        familyData = {
          id: familyDoc.id,
          ...fData,
          createdAt: fData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          tamagotchi: {
            ...fData.tamagotchi,
            lastChecked: fData.tamagotchi?.lastChecked?.toDate?.()?.toISOString() || new Date().toISOString()
          }
        };
      }
    }
  }

  return { user: userData, family: familyData };
}
