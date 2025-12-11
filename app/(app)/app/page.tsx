import { redirect } from "next/navigation";
import { defaultAppSlug } from "@/config/apps";

export default function AppIndexPage() {
  redirect(`/app/${defaultAppSlug}`);
}
