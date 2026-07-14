import { Suspense } from "react";
import RecordsPage from "@/components/RecordsPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <RecordsPage />
    </Suspense>
  );
}
