import Link from "next/link";
import { LockClosedIcon, VideoCameraIcon, MusicalNoteIcon, DocumentTextIcon } from "@heroicons/react/24/solid";

interface ContentCardProps {
  id: string;
  title: string;
  creatorAddress: string;
  type: string;
  price: string;
  thumbnailUrl: string;
}

export function ContentCard({ id, title, creatorAddress, type, price, thumbnailUrl }: ContentCardProps) {
  const isPaid = parseFloat(price) > 0;

  const TypeIcon = () => {
    switch (type) {
      case "VIDEO": return <VideoCameraIcon className="w-4 h-4" />;
      case "AUDIO": return <MusicalNoteIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  return (
    <Link href={`/content/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden bg-gray-800">
           <img src={thumbnailUrl} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />

           <div className="absolute top-2 right-2 flex gap-2">
             <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-white uppercase border border-white/10">
               <TypeIcon /> {type}
             </div>
           </div>

           {isPaid && (
             <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
               <LockClosedIcon className="w-3 h-3" />
               <span className="font-mono">{price} USDC</span>
             </div>
           )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-400 mt-1 font-mono truncate">
            by {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
          </p>
        </div>
      </div>
    </Link>
  );
}
