import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";

export default async function HomePage() {
  const { user } = await getUserWithFamily();

  if (!user) {
    redirect("/auth");
  }

  if (!user.familyId) {
    redirect("/family-setup");
  }

  // Get wishlist items for summary
  const itemsSnapshot = await adminDb
    .collection("families")
    .doc(user.familyId)
    .collection("wishlist")
    .where("isCompleted", "==", false)
    .get();

  const items = itemsSnapshot.docs.map(doc => doc.data());
  const myActive = items.filter(i => i.authorId === user.uid).length;
  const partnerActive = items.filter(i => i.authorId !== user.uid).length;

  // Get partner name
  let partnerName = "Партнер";
  if (user.partnerId) {
    const partnerDoc = await adminDb.collection("users").doc(user.partnerId).get();
    if (partnerDoc.exists) {
        partnerName = partnerDoc.data()?.name || "Партнер";
    }
  }

  return (
    <main className="p-6 pb-32">
      <h1 className="text-2xl font-bold mb-4">FamilyHub</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Добро пожаловать домой, {user.name}!
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {/* Wishlist Widget */}
        <Link
            href="/wishlist"
            className="p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-transform"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-brand-violet/10 text-brand-violet rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Вишлисты</p>
                    <p className="text-xl font-bold">Желания</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Мои</p>
                    <p className="text-lg font-bold">{myActive} <span className="text-xs font-normal text-zinc-400">активно</span></p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">{partnerName}</p>
                    <p className="text-lg font-bold">{partnerActive} <span className="text-xs font-normal text-zinc-400">активно</span></p>
                </div>
            </div>
        </Link>

        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm">Это главная страница. В следующих фазах здесь появится лента событий и тамагочи.</p>
        </div>
      </div>
    </main>
  );
}
