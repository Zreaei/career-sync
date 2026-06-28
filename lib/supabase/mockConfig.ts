const mockFlag = process.env.NEXT_PUBLIC_USE_MOCKS;
const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const USE_MOCKS = mockFlag === "1" || (mockFlag !== "0" && !hasSupabaseEnv);
