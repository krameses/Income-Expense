import { Suspense } from "react";
import FluteSchedulePage from "@/components/FluteSchedulePage";

export default function Schedule() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <FluteSchedulePage />
    </Suspense>
  );
}
