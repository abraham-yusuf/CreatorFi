"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function verifyPayment(contentId: string, txId: string) {
  // In a real app, verify txId on-chain.
  // For demo, we trust the client's assertion and set a secure cookie.

  const cookieStore = await cookies();

  // Set a cookie valid for this content
  // Format: x402-access-[contentId]
  cookieStore.set(`x402-access-${contentId}`, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return { success: true };
}

export async function createContent(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const type = formData.get("type") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const contentUrl = formData.get("contentUrl") as string;
  const body = formData.get("body") as string;
  // SECURITY NOTE: In a real production app, "walletAddress" should be verified via SIWE (Sign-In with Ethereum)
  // or a secure session cookie. Accepting it from raw form data allows impersonation.
  // For this MVP/Demo, we trust the client's assertion.
  const walletAddress = formData.get("walletAddress") as string;

  if (!walletAddress) {
    throw new Error("Wallet address required");
  }

  // Find or Create User
  let user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { walletAddress },
    });
  }

  await prisma.content.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      type,
      thumbnailUrl: thumbnailUrl || "https://via.placeholder.com/640x360",
      contentUrl: type !== "ARTICLE" ? contentUrl : undefined,
      body: type === "ARTICLE" ? body : undefined,
      creatorId: user.id,
    },
  });

  revalidatePath("/");
  redirect("/");
}
