import { customAlphabet } from "nanoid";
import { SHARE_SLUG_ALPHABET } from "@/lib/constants";

const createSlug = customAlphabet(SHARE_SLUG_ALPHABET, 12);

export function newShareSlug() {
  return createSlug();
}
