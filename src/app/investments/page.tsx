import { Suspense } from "react";
import InvestmentsPage from "@/components/InvestmentsPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading investments...</div>}>
      <InvestmentsPage />
    </Suspense>
  );
}
