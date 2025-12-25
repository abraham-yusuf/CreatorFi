import Link from "next/link";
import prisma from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ContentCard } from "@/components/ContentCard";

// Opt-out of static generation since we fetch data
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const where = filter && filter !== 'ALL' ? { type: filter } : {};
  const contents = await prisma.content.findMany({
    where,
    include: { creator: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-purple-500/30">

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Hero / Intro */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Web3 Creator Marketplace <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Pay-Per-View via X402
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Buy and sell premium content using USDC on Base.
            The first decentralized retail platform for creators.
          </p>
          <div className="flex justify-center gap-4">
             <Link href="/dashboard/create" className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
               Start Creating
             </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {['ALL', 'VIDEO', 'AUDIO', 'ARTICLE'].map((f) => (
                <Link
                    key={f}
                    href={f === 'ALL' ? '/' : `/?filter=${f}`}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                        (filter === f || (!filter && f === 'ALL'))
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                >
                    {f}
                </Link>
            ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
                <ContentCard
                    key={content.id}
                    id={content.id}
                    title={content.title}
                    creatorAddress={content.creator.walletAddress}
                    type={content.type}
                    price={content.price.toString()}
                    thumbnailUrl={content.thumbnailUrl}
                />
            ))}

            {contents.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                    No content found. Be the first to create something!
                </div>
            )}
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>&copy; 2024 X402 Demo. Powered by Coinbase CDP & Solana.</p>
        </footer>

      </main>
    </div>
  );
}
