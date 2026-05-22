import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Gift, Wallet, Heart, Star, Settings } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { FinanceEvent } from "@/types";

export default async function HomePage() {
  const { user } = await getUserWithFamily();

  if (!user) {
    redirect("/auth");
  }

  if (!user.familyId) {
    redirect("/family-setup");
  }

  const tiles = [
    {
      title: "Покупки",
      subtitle: "Список продуктов",
      href: "/shopping",
      icon: ShoppingBag,
      color: "bg-brand-emerald",
      size: "col-span-2",
    },
    {
      title: "Вишлисты",
      subtitle: "Идеи подарков",
      href: "/wishlist",
      icon: Gift,
      color: "bg-brand-violet",
      size: "col-span-1",
    },
    {
      title: "Деньги",
      subtitle: "Бюджет",
      href: "/money",
      icon: Wallet,
      color: "bg-brand-emerald",
      size: "col-span-1",
    },
    {
      title: "Здоровье",
      subtitle: "Скоро",
      href: "#",
      icon: Heart,
      color: "bg-red-400",
      size: "col-span-1",
      disabled: true,
    },
    {
      title: "Привычки",
      subtitle: "Скоро",
      href: "#",
      icon: Star,
      color: "bg-amber-400",
      size: "col-span-1",
      disabled: true,
    },
  ];

  // Fetch today's purchases for the notification block
  const today = new Date();
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.getDay();

  // We query all purchases and filter in memory for simplicity of "today" logic across timezones/recurrence
  const purchasesSnapshot = await adminDb
    .collection(`families/${user.familyId}/finance/data/events`)
    .where("type", "==", "purchase")
    .where("isCompleted", "==", false)
    .get();

  const todayPurchases = purchasesSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as FinanceEvent))
    .filter(event => {
      if (event.dateType === 'dayOfMonth') {
        return event.dateValue === dayOfMonth;
      } else {
        return event.dateValue === dayOfWeek;
      }
    });

  return (
    <main className="p-6 pb-24">
      {todayPurchases.length > 0 && (
        <div className="mb-6 p-4 bg-brand-emerald/10 border border-brand-emerald/20 rounded-2xl flex flex-col gap-3">
          {todayPurchases.map(purchase => (
            <div key={purchase.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                Сегодня запланирована закупка — <span className="font-bold">{purchase.title}</span>. Всё прошло? Записать сумму?
              </p>
              <Link
                href={`/money?purchaseId=${purchase.id}`}
                className="text-xs font-bold bg-brand-emerald text-white px-3 py-2 rounded-xl w-fit"
              >
                Записать сумму
              </Link>
            </div>
          ))}
        </div>
      )}

      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-zinc-500 font-medium">Привет,</p>
          <h1 className="text-3xl font-black">{user.name} 👋</h1>
        </div>
        <Link href="/settings" className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <Settings className="w-6 h-6 text-zinc-400" />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.title}
              href={tile.href}
              className={`${tile.size} group relative overflow-hidden p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm active:scale-[0.98] transition-all`}
            >
              <div className={`${tile.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-${tile.color.replace('bg-', '')}/20`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold leading-none mb-1">{tile.title}</h3>
              <p className="text-sm text-zinc-500 font-medium">{tile.subtitle}</p>

              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon className="w-12 h-12 text-zinc-100 dark:text-zinc-800 -mr-6 -mt-6" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-violet"></span>
          Что нового?
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Мы добавили раздел <b>Вишлисты</b>! Теперь вы можете делиться своими желаниями с близкими. Ищите плитку выше.
        </p>
      </div>
    </main>
  );
}
