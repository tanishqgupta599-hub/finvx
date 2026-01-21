import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await currentUser();

  if (user) {
    redirect("/home");
  }

  return <LandingPage />;
}