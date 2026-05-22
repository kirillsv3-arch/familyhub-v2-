"use client";

import { useEffect, useState } from "react";
import { FinanceEvent, PiggyBank, WishlistItem } from "@/types";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BalanceSummary from "@/components/money/BalanceSummary";
import HorizonFeed from "@/components/money/HorizonFeed";
import PiggyBanks from "@/components/money/PiggyBanks";
import ShoppingStats from "@/components/money/ShoppingStats";
import AddFinanceEventSheet from "@/components/money/AddFinanceEventSheet";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MoneyPageProps {
  familyId: string;
}

interface ShoppingStatsData {
  weeklyStats: number[];
  averageMonthly: number;
  averageWeekly: number;
}

export default function MoneyPage({ familyId }: MoneyPageProps) {
  const [events, setEvents] = useState<FinanceEvent[]>([]);
  const [savings, setSavings] = useState<PiggyBank[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [stats, setStats] = useState<ShoppingStatsData | null>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  useEffect(() => {
    // Real-time listeners
    const eventsRef = collection(db, `families/${familyId}/finance/data/events`);
    const unsubEvents = onSnapshot(query(eventsRef), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinanceEvent)));
    });

    const savingsRef = collection(db, `families/${familyId}/finance/data/savings`);
    const unsubSavings = onSnapshot(query(savingsRef), (snapshot) => {
      setSavings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PiggyBank)));
    });

    const wishlistRef = collection(db, `families/${familyId}/wishlists`);
    const unsubWishlist = onSnapshot(query(wishlistRef), (snapshot) => {
      setWishlist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem)));
    });

    // Fetch stats (non-real-time is fine for performance)
    fetch("/api/money/stats").then(res => res.json()).then(setStats);

    return () => {
      unsubEvents();
      unsubSavings();
      unsubWishlist();
    };
  }, [familyId]);

  const handleAddEvent = async (data: Partial<FinanceEvent>) => {
    await fetch("/api/money/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const handleCompletePurchase = async (id: string, amount: number) => {
    await fetch("/api/money/events", {
      method: "PATCH",
      body: JSON.stringify({ id, isCompleted: true, completedAmount: amount }),
    });
    // Refresh stats
    fetch("/api/money/stats").then(res => res.json()).then(setStats);
  };

  const handleSkipPurchase = async (id: string) => {
    await fetch("/api/money/events", {
      method: "PATCH",
      body: JSON.stringify({ id, isCompleted: true, completedAmount: 0 }),
    });
  };

  const handleAddFromWishlist = async (item: WishlistItem) => {
    await fetch("/api/money/savings", {
      method: "POST",
      body: JSON.stringify({
        title: item.name,
        targetAmount: item.price || 0,
        wishlistItemId: item.id
      }),
    });
  };

  const handleContribute = async (id: string) => {
    const amount = prompt("Сколько внести?");
    if (amount && !isNaN(Number(amount))) {
      await fetch("/api/money/savings", {
        method: "PATCH",
        body: JSON.stringify({ id, contributionAmount: Number(amount) }),
      });
    }
  };

  return (
    <main className="p-6 pb-32">
      <header className="flex justify-between items-center mb-8">
        <Link href="/" className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black">Бюджет</h1>
        <button
          onClick={() => setIsAddSheetOpen(true)}
          className="w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="space-y-10">
        <BalanceSummary events={events} />

        <HorizonFeed
          events={events}
          onComplete={handleCompletePurchase}
          onSkip={handleSkipPurchase}
        />

        <PiggyBanks
          savings={savings}
          wishlist={wishlist}
          onAddFromWishlist={handleAddFromWishlist}
          onContribute={handleContribute}
        />

        <ShoppingStats stats={stats} />
      </div>

      <AddFinanceEventSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAdd={handleAddEvent}
      />
    </main>
  );
}
