import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const content = await prisma.content.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  // --- Payment Verification Logic ---
  const cookieStore = await cookies();
  const paymentCookie = cookieStore.get(`x402-access-${id}`);

  // Check if cookie exists and matches "true"
  const isPaid = paymentCookie?.value === "true";

  if (!isPaid) {
    return NextResponse.json(
      { error: "Payment Required" },
      {
        status: 402,
        headers: {
          "X-Payment-Address": content.creator.walletAddress,
          "X-Payment-Amount": content.price.toString(),
          "X-Payment-Currency": content.currency,
        },
      }
    );
  }

  // --- Content Delivery ---
  return NextResponse.json({
    type: content.type,
    // If it's an article, return text. If media, return URL.
    data: content.type === "ARTICLE" ? content.textContent : content.contentUrl
  });
}
