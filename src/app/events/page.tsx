import { Suspense } from "react";
import EventsPage from "@/components/EventsPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading events...</div>}>
      <EventsPage />
    </Suspense>
  );
}
