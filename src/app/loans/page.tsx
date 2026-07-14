import { Suspense } from "react";
import LoansPage from "@/components/LoansPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading loans...</div>}>
      <LoansPage />
    </Suspense>
  );
}
