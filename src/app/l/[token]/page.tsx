import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type Params = { params: Promise<{ token: string }> };

export default async function QrRedirectPage({ params }: Params) {
  const { token } = await params;

  const location = await prisma.storageLocation.findUnique({
    where: { qrToken: token },
    select: { id: true },
  });

  if (!location) notFound();

  redirect(`/locations/${location.id}`);
}
