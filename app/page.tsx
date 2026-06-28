import { redirect } from "next/navigation";
import { USE_MOCKS } from "@/lib/supabase/mockConfig";

export default function Home() {
  if (USE_MOCKS) redirect("/admin/dashboard");
  redirect("/login");
}
