import { Suspense } from "react";
import TransactionsPage from "@/components/TransactionsPage";

export default function Transactions() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <TransactionsPage />
    </Suspense>
  );
}
