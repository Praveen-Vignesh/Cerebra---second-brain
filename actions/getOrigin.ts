import { headers } from "next/headers";

export async function getOrigin() {
  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") ?? "http";

  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host");

  return `${protocol}://${host}`;
}