import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Book } from "@/lib/types";
import { fmt } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";

export function BookCard({ book }: { book: Book }) {
  const soldOut = book.quantity_available <= 0 && book.mode !== "rent";
  const discount =
    book.original_price && book.original_price > book.sell_price
      ? Math.round(((book.original_price - book.sell_price) / book.original_price) * 100)
      : 0;
  return (
    <Link
      to="/book/$id"
      params={{ id: book.id }}
      className="group flex flex-col rounded-xl overflow-hidden bg-card border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all"
    >
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground text-sm">No cover</div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">-{discount}%</Badge>
          )}
          {book.is_featured && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">Hot</Badge>
          )}
          {soldOut && <Badge className="bg-danger text-danger-foreground">Sold out</Badge>}
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{book.author}</div>
        <div className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-warning text-warning" />
          {book.rating.toFixed(1)}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          {book.mode !== "rent" ? (
            <>
              <span className="font-semibold text-accent">{fmt(book.sell_price)}</span>
              {book.original_price && book.original_price > book.sell_price && (
                <span className="text-xs text-muted-foreground line-through">{fmt(book.original_price)}</span>
              )}
            </>
          ) : (
            <span className="font-semibold text-primary">
              {fmt(book.rent_price_per_week)}<span className="text-xs font-normal text-muted-foreground">/wk</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
