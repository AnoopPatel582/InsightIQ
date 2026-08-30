import { redirect } from "next/navigation";

/**
 * Root page — redirect immediately to the login page.
 * All actual content lives under /login and /dashboard.
 */
export default function Home() {
  redirect("/login");
}
