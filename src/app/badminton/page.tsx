import { Suspense } from "react";
import BadmintonPage from "@/components/BadmintonPage";

export default function Badminton() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <BadmintonPage />
    </Suspense>
  );
}
