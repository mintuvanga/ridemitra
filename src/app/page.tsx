import { redirect } from "next/navigation";

export default function Home() {
  // Development shortcut: open the next page directly while login is being finished.
  redirect("/driver/documents");
}
