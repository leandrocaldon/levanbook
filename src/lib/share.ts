import { customAlphabet } from "nanoid";
import { SHARE_SLUG_ALPHABET } from "@/lib/constants";

const SLUG_LENGTH = 12;
const createSlug = customAlphabet(SHARE_SLUG_ALPHABET, SLUG_LENGTH);
const SHARE_SLUG_PATTERN = new RegExp(`^[${SHARE_SLUG_ALPHABET}]{${SLUG_LENGTH}}$`);

export function newShareSlug() {
  return createSlug();
}

export function isShareSlug(value: string): boolean {
  return SHARE_SLUG_PATTERN.test(value);
}
