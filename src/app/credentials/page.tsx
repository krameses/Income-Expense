import { Suspense } from "react";
import CredentialsPage from "@/components/CredentialsPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CredentialsPage />
    </Suspense>
  );
}
