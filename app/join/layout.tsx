import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ReactNode } from "react";

export default function JoinLayout({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
