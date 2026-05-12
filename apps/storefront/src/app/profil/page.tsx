import { Suspense } from "react";
import ProfilePageContent from "./ProfilePageContent";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent />
    </Suspense>
  );
}
