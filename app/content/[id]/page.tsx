import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { AccessController } from "@/components/AccessController";

// Opt-out of static generation
export const dynamic = 'force-dynamic';

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch Content Logic (Public Metadata Only)
  const content = await prisma.content.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!content) {
    notFound();
  }

  // NOTE: We no longer check payment here.
  // The Client Component <AccessController> handles the API check.

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
           <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>
           <p className="text-gray-400">
             Created by <span className="font-mono text-blue-400">{content.creator.walletAddress.slice(0,6)}...</span> • {content.type}
           </p>
        </div>

        {/* Content Area - Delegated to AccessController */}
        <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl mb-8">
           <AccessController
              contentId={content.id}
              type={content.type}
              price={content.price.toString()}
              currency={content.currency}
              creatorAddress={content.creator.walletAddress}
              thumbnailUrl={content.thumbnailUrl}
           />
        </div>

        {/* Description */}
        <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-bold">About this content</h3>
            <p className="text-gray-300">{content.description}</p>
        </div>
      </main>
    </div>
  );
}
