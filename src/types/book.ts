export type Book = {
  id: string;
  owner_id: string;
  title: string;
  storage_key: string;
  storage_url: string | null;
  cover_key: string | null;
  cover_url: string | null;
  page_count: number;
  file_size: number | null;
  share_slug: string | null;
  is_public: boolean;
  created_at: string;
};

export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};
