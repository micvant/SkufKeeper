import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { getLocationById } from "@/lib/queries/entities";
import { isLocationFavorite } from "@/lib/queries/home";
import { redirect } from "next/navigation";
import { LocationPageClient } from "./LocationPageClient";

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { id } = await params;
  const location = await getLocationById(userId, id);

  if (!location) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-slate-500">Место не найдено</p>
        <Link href="/" className="mt-4 inline-block text-primary">
          На главную
        </Link>
      </div>
    );
  }

  const isFavorite = await isLocationFavorite(userId, id);

  return <LocationPageClient location={location} isFavorite={isFavorite} />;
}
