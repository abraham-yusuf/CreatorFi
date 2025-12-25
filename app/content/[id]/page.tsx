import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Paywall } from "@/components/Paywall";
import { Header } from "@/components/Header";

// Opt-out of static generation
export const dynamic = 'force-dynamic';

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch Content Logic
  const content = await prisma.content.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!content) {
    notFound();
  }

  // 2. Check Payment (Cookie Proof)
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(`x402-access-${id}`)?.value === "true";
  const isFree = parseFloat(content.price.toString()) === 0;

  const showContent = isFree || hasAccess;

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

        {/* Content Area */}
        <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl mb-8">
            {showContent ? (
                // UNLOCKED STATE
                <div className="animate-fade-in">
                    {content.type === "VIDEO" && (
                        <video controls className="w-full aspect-video" poster={content.thumbnailUrl}>
                            {content.contentUrl && <source src={content.contentUrl} />}
                            Your browser does not support video.
                        </video>
                    )}

                    {content.type === "AUDIO" && (
                        <div className="p-12 flex flex-col items-center justify-center bg-gray-900">
                            <img src={content.thumbnailUrl} className="w-48 h-48 object-cover rounded-lg shadow-lg mb-6" />
                            <audio controls className="w-full max-w-md">
                                {content.contentUrl && <source src={content.contentUrl} />}
                            </audio>
                        </div>
                    )}

                    {content.type === "ARTICLE" && (
                        <div className="p-8 md:p-12 prose prose-invert max-w-none">
                            <img src={content.thumbnailUrl} className="w-full h-64 md:h-96 object-cover rounded-xl mb-8" />
                            <div dangerouslySetInnerHTML={{ __html: content.body?.replace(/\n/g, '<br/>') || "" }} />
                        </div>
                    )}
                </div>
            ) : (
                // LOCKED STATE (PAYWALL)
                <Paywall
                    contentId={content.id}
                    price={content.price.toString()}
                    currency={content.currency}
                    creatorAddress={content.creator.walletAddress}
                    thumbnailUrl={content.thumbnailUrl}
                />
            )}
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
