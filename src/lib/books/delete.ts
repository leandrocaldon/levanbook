import { BOOKS_BUCKET } from "@/lib/constants";
import { insforge } from "@/lib/insforge/client";

export type DeletableBook = {
  id: string;
  storage_key: string;
  cover_key: string | null;
};

export async function deleteOwnedBook(book: DeletableBook) {
  const keys = [book.storage_key, book.cover_key].filter(
    (key): key is string => Boolean(key),
  );
  if (keys.length > 0) {
    await insforge.storage.from(BOOKS_BUCKET).remove(keys);
  }

  const { error } = await insforge.database.from("books").delete().eq("id", book.id);
  if (error) {
    throw new Error("DELETE_FAILED");
  }
}
