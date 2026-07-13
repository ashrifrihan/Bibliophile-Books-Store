export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  description: string;
  cover_url: string | null;
  category: string;
  mode: "sell" | "rent" | "both";
  sell_price: number;
  original_price: number | null;
  rent_price_per_week: number;
  quantity_total: number;
  quantity_available: number;
  rating: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  book_id: string;
  type: "sale" | "rent";
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  payment_status: "pending" | "paid";
  amount: number;
  rent_weeks: number | null;
  created_at: string;
  updated_at: string;
  books?: Pick<Book, "title" | "author" | "cover_url">;
};

export type Rental = {
  id: string;
  order_id: string;
  start_date: string | null;
  due_date: string | null;
  returned_date: string | null;
  late_fee: number;
  created_at: string;
  updated_at: string;
  orders?: Order;
};

export const CATEGORIES = [
  "Fiction",
  "Fantasy",
  "Spirituality",
  "Poetry",
  "Educational",
  "Art",
] as const;
