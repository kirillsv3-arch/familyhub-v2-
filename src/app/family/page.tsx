import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Users, User as UserIcon } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";

export default async function FamilyPage() {
  const { user, family } = await getUserWithFamily();

  if (!user) {
    redirect("/auth");
  }

  if (!user.familyId || !family) {
    redirect("/family-setup");
  }

  // Get partner info if exists
  let partner = null;
  if (user.partnerId) {
    const partnerDoc = await adminDb.collection("users").doc(user.partnerId).get();
    if (partnerDoc.exists) {
      partner = partnerDoc.data();
    }
  }

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Семья</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-500">Участники</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-brand-violet rounded-full flex items-center justify-center text-white">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">{user.name} (Вы)</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>

          {partner ? (
            <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 bg-brand-emerald rounded-full flex items-center justify-center text-white">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">{partner.name}</p>
                <p className="text-sm text-zinc-500">{partner.email}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                <Users className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium">Партнер еще не присоединился</p>
              <p className="text-xs text-zinc-500">Поделитесь кодом: <span className="font-bold text-foreground">{family.code}</span></p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-500">Статус Семьи</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 mb-1">Монеты</p>
            <p className="text-2xl font-bold">{family.coins} 🪙</p>
          </div>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 mb-1">Уровень</p>
            <p className="text-2xl font-bold">{family.tamagotchi.level} ⭐</p>
          </div>
        </div>
      </section>
    </main>
  );
}
