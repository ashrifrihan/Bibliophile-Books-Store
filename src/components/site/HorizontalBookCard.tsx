import { Link } from "@tanstack/react-router";
import type { Book } from "@/lib/types";
import { fmt } from "@/lib/cart";

export function HorizontalBookCard({ book }: { book: Book }) {
  const discount =
    book.original_price && book.original_price > book.sell_price
      ? Math.round(((book.original_price - book.sell_price) / book.original_price) * 100)
      : 0;
  
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
          <h3 className="font-display font-semibold text-xl md:text-2xl text-primary leading-tight mb-1 truncate">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
            {book.description || `A wonderful addition to your collection. Discover more about ${book.title} by ${book.author}.`}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 gap-4">
          <Link
            to="/book/$id"
            params={{ id: book.id }}
            className="inline-flex items-center justify-center bg-primary-soft hover:bg-primary-soft/80 text-primary text-sm font-semibold px-6 py-2 rounded-full transition-colors shrink-0"
          >
            View Details
          </Link>
          
          <div className="flex flex-col items-end gap-0.5 text-right shrink-0">
            {discount > 0 && (
              <span className="inline-block bg-accent-soft text-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}% OFF
              </span>
            )}
            <div className="flex items-baseline gap-1">
              {book.mode !== "rent" ? (
                <>
                  <span className="font-bold text-accent text-base md:text-lg">{fmt(book.sell_price)}</span>
                  {book.original_price && book.original_price > book.sell_price && (
                    <span className="text-[10px] md:text-xs text-muted-foreground line-through">{fmt(book.original_price)}</span>
                  )}
                </>
              ) : (
                <span className="font-bold text-primary text-base md:text-lg">
                  {fmt(book.rent_price_per_week)}<span className="text-[10px] md:text-xs font-normal text-muted-foreground">/wk</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
