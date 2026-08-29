import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Source } from "@/lib/types";

const MAX_CLAIM_LENGTH = 2000;
const MAX_RESULTS = 5;

// Short/common words carry no retrieval signal and would match almost every
// row in the KB, drowning out the terms that actually distinguish a claim.
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "being", "to", "of", "in", "on", "at", "for", "with", "by", "from",
  "as", "it", "this", "that", "these", "those", "i", "you", "he", "she",
  "they", "we", "my", "your", "his", "her", "their", "our", "will", "would",
  "can", "could", "should", "have", "has", "had", "do", "does", "did", "not",
  "no", "so", "if", "than", "then", "just", "get", "got", "me", "us",
]);

/**
 * Lowercase, trim, strip URLs, cap length, and reduce to a set of keyword
 * tokens usable for ILIKE overlap matching against reference_snippets.
 */
function extractKeywords(claim: string): string[] {
  const normalized = claim
    .toLowerCase()
    .trim()
    .replace(/https?:\/\/\S+/g, " ")
    .slice(0, MAX_CLAIM_LENGTH);

  const tokens = normalized.match(/[a-z0-9%]+/g) ?? [];
  const keywords = tokens.filter((t) => t.length >= 3 && !STOPWORDS.has(t));

  // De-dupe while preserving first-seen order.
  return Array.from(new Set(keywords));
}

/**
 * Tier 1 retrieval: keyword-overlap match of the claim against the seeded
 * `reference_snippets` table (topic + snippet columns), via ILIKE. This is
 * the sole retrieval seam for scam-check grounding - a Tier 2 web-search
 * branch can be added here later (merged in, same Source[] shape out)
 * without any caller needing to change. Never fabricates a source: returns
 * [] when nothing matches.
 */
export async function retrieveContext(claim: string): Promise<Source[]> {
  const keywords = extractKeywords(claim);
  if (keywords.length === 0) {
    return [];
  }

  // Cap the number of OR'd keyword terms so the query stays cheap even on a
  // long claim.
  const searchTerms = keywords.slice(0, 12);

  const supabase = createServiceRoleClient();
  const orFilter = searchTerms
    .flatMap((term) => [`topic.ilike.%${term}%`, `snippet.ilike.%${term}%`, `title.ilike.%${term}%`])
    .join(",");

  const { data, error } = await supabase
    .from("reference_snippets")
    .select("title,url,snippet")
    .or(orFilter)
    .limit(MAX_RESULTS);

  if (error) {
    console.error("[retrieveContext] reference_snippets query failed", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row) => ({
    title: row.title as string,
    url: row.url as string,
    snippet: row.snippet as string,
  }));
}
