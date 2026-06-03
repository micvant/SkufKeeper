import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { getItemById } from "@/lib/queries/entities";
import { redirect } from "next/navigation";
import { ItemPageClient } from "./ItemPageClient";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { id } = await params;
  const item = await getItemById(userId, id);

  if (!item) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-slate-500">Объект не найден</p>
        <Link href="/" className="mt-4 inline-block text-primary">
          На главную
        </Link>
      </div>
    );
  }

  return <ItemPageClient item={item} />;
}
