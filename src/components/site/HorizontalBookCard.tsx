import { Link } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import type { Book } from "@/lib/types";

export function HorizontalBookCard({ book }: { book: Book }) {
  const isRent = book.mode === "rent";
  
  return (
    <div className="flex bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border h-48 md:h-56">
      {/* Image Side */}
      <div className="w-1/3 min-w-[120px] max-w-[160px] relative bg-muted shrink-0">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground text-xs text-center p-2">
            No cover
          </div>
        )}
      </div>

      {/* Content Side */}
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-xl md:text-2xl text-[#1e3a5f] leading-tight mb-1 truncate">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
            {book.description || `A wonderful addition to your collection. Discover more about ${book.title} by ${book.author}.`}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Link
            to="/book/$id"
            params={{ id: book.id }}
            className="inline-flex items-center justify-center bg-[#f3e8ff] hover:bg-[#e9d5ff] text-[#6b21a8] text-sm font-semibold px-6 py-2 rounded-full transition-colors"
          >
            Read More
          </Link>
          <button className="text-muted-foreground hover:text-foreground transition-colors p-2">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
