import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Gift, TrendingUp, CheckSquare, Star, Bell } from "lucide-react";

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
      title: "Задачи",
      subtitle: "Планировщик",
      href: "/tasks",
      icon: CheckSquare,
      color: "bg-brand-violet",
      size: "col-span-1",
    },
    {
      title: "Бюджет",
      subtitle: "Ваш горизонт",
      href: "/finance",
      icon: TrendingUp,
      color: "bg-brand-violet",
      size: "col-span-1",
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
      title: "Привычки",
      subtitle: "Скоро",
      href: "#",
      icon: Star,
      color: "bg-amber-400",
      size: "col-span-1",
      disabled: true,
    },
  ];

  return (
    <main className="p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-zinc-500 font-medium">Привет,</p>
          <h1 className="text-3xl font-black">{user.name} 👋</h1>
        </div>
        <Link href="/notifications" className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <Bell className="w-6 h-6 text-zinc-400" />
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
