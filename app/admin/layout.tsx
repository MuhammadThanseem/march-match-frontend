import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies(); // ✅ FIX
  const token = cookieStore.get("token")?.value;

  let user: any = null;

  if (token) {
    try {
      user = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
    } catch (e) {
      redirect("/login");
    }
  }

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "superadmin") {
    redirect("/home");
  }

  return <>{children}</>;
}