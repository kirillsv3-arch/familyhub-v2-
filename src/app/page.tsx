import { getUserWithFamily } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { user } = await getUserWithFamily();

  if (!user) {
    redirect("/auth");
  }

  if (!user.familyId) {
    redirect("/family-setup");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">FamilyHub</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Добро пожаловать домой, {user.name}!
      </p>

      <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <p className="text-sm">Это главная страница. В следующих фазах здесь появится лента событий и тамагочи.</p>
      </div>
    </main>
  );
}
