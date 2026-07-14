import { Suspense } from "react";
import ReportPage from "@/components/ReportPage";

export default function Report() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <ReportPage />
    </Suspense>
  );
}
