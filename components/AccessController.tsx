"use client";

import { useEffect, useState, useCallback } from "react";
import { Paywall } from "./Paywall";
import { Loader2, Lock, Play, Music, FileText } from "lucide-react";

interface AccessControllerProps {
  contentId: string;
  type: string; // "ARTICLE" | "VIDEO" | "AUDIO"
  price: string;
  currency: string;
  creatorAddress: string;
  thumbnailUrl: string;
}

type AccessStatus = "loading" | "locked" | "unlocked";

export function AccessController({
  contentId,
  type,
  price,
  currency,
  creatorAddress,
  thumbnailUrl,
}: AccessControllerProps) {
  const [status, setStatus] = useState<AccessStatus>("loading");
  const [contentData, setContentData] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/access/${contentId}`);
      if (res.status === 200) {
        const json = await res.json();
        setContentData(json.data);
        setStatus("unlocked");
      } else if (res.status === 402) {
        setStatus("locked");
      } else {
        console.error("Unexpected status code:", res.status);
        setStatus("locked"); // Default to locked on error
      }
    } catch (error) {
      console.error("Failed to fetch access status:", error);
      setStatus("locked");
    }
  }, [contentId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (status === "loading") {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-gray-900 rounded-xl border border-gray-800">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded-full">
            <Lock className="text-white w-6 h-6" />
        </div>
        <Paywall
          contentId={contentId}
          price={price}
          currency={currency}
          creatorAddress={creatorAddress}
          thumbnailUrl={thumbnailUrl}
          onSuccess={() => {
            // Immediately try to fetch content again
            fetchContent();
          }}
        />
      </div>
    );
  }

  // Unlocked State
  return (
    <div className="animate-fade-in relative">
      {type === "VIDEO" && (
        <div className="relative">
          <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded-full">
            <Play className="text-white w-6 h-6" />
          </div>
          <video controls className="w-full aspect-video rounded-xl" poster={thumbnailUrl}>
            {contentData && <source src={contentData} />}
            Your browser does not support video.
          </video>
        </div>
      )}

      {type === "AUDIO" && (
        <div className="p-12 flex flex-col items-center justify-center bg-gray-900 rounded-xl border border-gray-800 relative">
          <div className="absolute top-4 left-4 bg-black/50 p-2 rounded-full">
             <Music className="text-white w-6 h-6" />
          </div>
          <img
            src={thumbnailUrl}
            className="w-48 h-48 object-cover rounded-lg shadow-lg mb-6"
            alt="Album Art"
          />
          <audio controls className="w-full max-w-md">
            {contentData && <source src={contentData} />}
          </audio>
        </div>
      )}

      {type === "ARTICLE" && (
        <div className="p-8 md:p-12 prose prose-invert max-w-none bg-gray-900 rounded-xl border border-gray-800 relative">
           <div className="absolute top-4 left-4 bg-black/50 p-2 rounded-full z-10">
             <FileText className="text-white w-6 h-6" />
          </div>
          <img
            src={thumbnailUrl}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
            alt="Article Cover"
          />
          <div
            dangerouslySetInnerHTML={{
              __html: contentData?.replace(/\n/g, "<br/>") || "",
            }}
          />
        </div>
      )}
    </div>
  );
}
