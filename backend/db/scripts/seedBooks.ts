import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { Pool, type PoolClient } from "pg";

dotenv.config();

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  isbn?: string[];
  first_publish_year?: number;
  subject?: string[];
};

type OpenLibrarySearchResult = {
  docs: OpenLibraryDoc[];
  numFound: number;
  start: number;
};

type OpenLibraryDescriptionResponse = {
  description?: string | { value?: string };
};

type SeedBook = {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  audience: string;
  description: string;
  publicationYear: number | null;
  averageRating: number;
};

type BranchId = 1 | 2 | 3 | 4;

type ParsedArgs = {
  count: number;
  branch: BranchId | null;
};

type RunStats = {
  requested: number;
  candidateBooks: number;
  insertedBooks: number;
  insertedCopies: number;
  skippedMissingData: number;
  skippedDuplicateFetch: number;
  skippedExistingDb: number;
  skippedMissingCover: number;
  forcedBranch: BranchId | null;
  insertedBookDetails: Array<{ title: string; isbn: string }>;
};

// DB connection for this script
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD ?? ""),
  database: process.env.DB_NAME,
  ssl:
    String(process.env.DB_SSL || "").toLowerCase() === "true"
      ? { rejectUnauthorized: false }
      : false,
});

const DEFAULT_COUNT = 100;
const PAGE_SIZE = 25;
const HARD_MAX_PAGES_PER_GENRE = 30;

// Genres to search
const SEARCH_TERMS = [
  "fantasy",
  "science fiction",
  "mystery",
  "history",
  "biography",
  "technology",
  "romance",
  "horror",
  "juvenile fiction",
  "adventure",
  "fiction",
  "thriller",
  "children",
  "young adult",
];

// Branch names to IDs
const BRANCH_NAME_TO_ID: Record<string, BranchId> = {
  central: 1,
  west: 2,
  east: 3,
  south: 4,
};

// Branch IDs to barcode codes
const BRANCH_ID_TO_CODE: Record<BranchId, string> = {
  1: "01",
  2: "02",
  3: "03",
  4: "04",
};

// Genre names to barcode codes
const GENRE_CODE_MAP: Record<string, string> = {
  "fantasy": "01",
  "science fiction": "02",
  "mystery": "03",
  "history": "04",
  "biography": "05",
  "technology": "06",
  "romance": "07",
  "horror": "08",
  "juvenile fiction": "09",
  "adventure": "10",
  "fiction": "11",
  "thriller": "12",
  "children": "13",
  "young adult": "14",
};

let skippedMissingData = 0;
let skippedDuplicateFetch = 0;
let skippedMissingCover = 0;

// Cache work descriptions so we do not fetch the same one twice
const descriptionCache = new Map<string, string | null>();

// Read command flags
function parseArgs(): ParsedArgs {
  const countArg = process.argv.find((arg) => arg.startsWith("--count="));
  const branchArg = process.argv.find((arg) => arg.startsWith("--branch="));

  const count = countArg ? Number(countArg.split("=")[1]) : DEFAULT_COUNT;

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("Invalid --count value. Use a positive whole number.");
  }

  let branch: BranchId | null = null;

  if (branchArg) {
    const raw = branchArg.split("=")[1]?.trim().toLowerCase();

    if (!raw || raw === "all" || raw === "random") {
      branch = null;
    } else if (raw in BRANCH_NAME_TO_ID) {
      branch = BRANCH_NAME_TO_ID[raw];
    } else {
      const branchNum = Number(raw);

      if (branchNum === 1 || branchNum === 2 || branchNum === 3 || branchNum === 4) {
        branch = branchNum;
      } else {
        throw new Error(
          "Invalid --branch value. Use 1-4, central, west, east, south, all, or random."
        );
      }
    }
  }

  return { count, branch };
}

// Clean up text
function cleanText(value?: string | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned.length ? cleaned : null;
}

// Normalize ISBN for matching
function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[^0-9Xx]/g, "").toUpperCase();
}

// Pick the best ISBN
function pickBestIsbn(isbns?: string[]): string | null {
  if (!isbns || isbns.length === 0) return null;

  const cleaned = isbns
    .map((isbn) => normalizeIsbn(isbn))
    .filter((isbn) => isbn.length === 10 || isbn.length === 13);

  if (cleaned.length === 0) return null;

  const isbn13 = cleaned.find((isbn) => isbn.length === 13);
  return isbn13 ?? cleaned[0] ?? null;
}

// Normalize genre names
function normalizeGenre(searchTerm: string, subject?: string): string {
  const term = searchTerm.trim().toLowerCase();
  const subj = cleanText(subject)?.toLowerCase();

  if (term in GENRE_CODE_MAP) return toTitleCase(term);
  if (subj && subj in GENRE_CODE_MAP) return toTitleCase(subj);

  return toTitleCase(term);
}

// Make title case
function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Pick audience from search term/genre
function getAudience(searchTerm: string, genre: string): string {
  const term = searchTerm.trim().toLowerCase();
  const normalizedGenre = genre.trim().toLowerCase();

  if (term === "children" || term === "juvenile fiction") return "Juvenile";
  if (term === "young adult") return "Young Adult";

  if (normalizedGenre === "children" || normalizedGenre === "juvenile fiction") {
    return "Juvenile";
  }

  if (normalizedGenre === "young adult") {
    return "Young Adult";
  }

  return "Adult";
}

// Make a short description
function buildDescription(doc: OpenLibraryDoc, genre: string): string {
  const author = cleanText(doc.author_name?.[0]) ?? "Unknown author";
  const year = doc.first_publish_year ? ` First published: ${doc.first_publish_year}.` : "";
  return `${genre} title by ${author}.${year}`.trim();
}

// Pick a random rating with rolls
function getRandomAverageRating(): number {
  const roll = Math.random() * 100;

  // Lowest chance
  if (roll < 3) return 1.0;
  if (roll < 6) return 1.5;

  // Lower chance
  if (roll < 12) return 2.0;
  if (roll < 18) return 2.5;

  // Highest chance
  if (roll < 33) return 3.0;
  if (roll < 50) return 3.5;
  if (roll < 67) return 4.0;
  if (roll < 84) return 4.5;

  // Lower than middle, higher than lowest
  return 5.0;
}

// Pull a real description from the work JSON
async function fetchWorkDescription(workKey?: string): Promise<string | null> {
  if (!workKey) {
    return null;
  }

  if (descriptionCache.has(workKey)) {
    return descriptionCache.get(workKey) ?? null;
  }

  const url = `https://openlibrary.org${workKey}.json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      descriptionCache.set(workKey, null);
      return null;
    }

    const data = (await res.json()) as OpenLibraryDescriptionResponse;

    let description: string | null = null;

    if (typeof data.description === "string") {
      description = cleanText(data.description);
    } else if (data.description && typeof data.description.value === "string") {
      description = cleanText(data.description.value);
    }

    descriptionCache.set(workKey, description ?? null);
    return description ?? null;
  } catch {
    descriptionCache.set(workKey, null);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Convert API data into our book object
async function mapDocToBook(doc: OpenLibraryDoc, searchTerm: string): Promise<SeedBook | null> {
  const title = cleanText(doc.title);
  const author = cleanText(doc.author_name?.[0]);
  const rawIsbn = pickBestIsbn(doc.isbn);

  if (!title || !author || !rawIsbn) {
    skippedMissingData++;
    return null;
  }

  const isbn = normalizeIsbn(rawIsbn);
  const genre = normalizeGenre(searchTerm, doc.subject?.[0]);
  const audience = getAudience(searchTerm, genre);

  // Try real description first, fallback to generic one
  const realDescription = await fetchWorkDescription(doc.key);
  const description = realDescription ?? buildDescription(doc, genre);

  const publicationYear =
    typeof doc.first_publish_year === "number" ? doc.first_publish_year : null;
  const averageRating = getRandomAverageRating();

  return {
    isbn,
    title,
    author,
    genre,
    audience,
    description,
    publicationYear,
    averageRating,
  };
}

// Use ISBN to avoid duplicate fetch results
function makeFetchDedupeKey(book: SeedBook): string {
  return normalizeIsbn(book.isbn);
}

// Build the cover URL
function buildCoverUrl(isbn: string): string {
  return `https://covers.openlibrary.org/b/isbn/${normalizeIsbn(isbn)}-L.jpg?default=false`;
}

// Check if a real cover exists
async function coverExists(isbn: string): Promise<boolean> {
  const url = buildCoverUrl(isbn);

  try {
    const res = await fetch(url, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

// Fetch one Open Library page
async function fetchOpenLibraryPage(
  searchTerm: string,
  page: number
): Promise<OpenLibrarySearchResult> {
  const url =
    `https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}` +
    `&page=${page}&limit=${PAGE_SIZE}&fields=key,title,author_name,isbn,first_publish_year,subject`;

  console.log(`Fetching: ${searchTerm} page ${page}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      console.log(`Skipping ${searchTerm} page ${page} because response was ${res.status}`);
      return { docs: [], numFound: 0, start: 0 };
    }

    const data = (await res.json()) as {
      docs?: OpenLibraryDoc[];
      numFound?: number;
      start?: number;
      num_found?: number;
    };

    return {
      docs: data.docs ?? [],
      numFound: data.numFound ?? data.num_found ?? 0,
      start: data.start ?? 0,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log(`Skipping ${searchTerm} page ${page} because it timed out`);
      return { docs: [], numFound: 0, start: 0 };
    }

    console.log(`Skipping ${searchTerm} page ${page} because of a fetch error`);
    return { docs: [], numFound: 0, start: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

// Collect books in round-robin order
async function collectCandidateBooks(targetCount: number): Promise<SeedBook[]> {
  const seen = new Set<string>();
  const collected: SeedBook[] = [];
  const maxCandidates = targetCount * 2;

  // Save page counts per genre
  const maxPagesByGenre: Record<string, number> = {};

  for (let page = 1; page <= HARD_MAX_PAGES_PER_GENRE; page++) {
    let foundAnythingThisRound = false;

    for (const term of SEARCH_TERMS) {
      if (collected.length >= maxCandidates) {
        return collected;
      }

      // Skip if we already know this genre has fewer pages
      if (maxPagesByGenre[term] && page > maxPagesByGenre[term]) {
        continue;
      }

      const result = await fetchOpenLibraryPage(term, page);
      const docs = result.docs;

      // Figure out the real page count from page 1
      if (page === 1) {
        const totalPages = Math.ceil(result.numFound / PAGE_SIZE);
        maxPagesByGenre[term] = Math.min(totalPages, HARD_MAX_PAGES_PER_GENRE);
      }

      if (docs.length === 0) {
        continue;
      }

      foundAnythingThisRound = true;

      for (const doc of docs) {
        const mapped = await mapDocToBook(doc, term);

        if (!mapped) continue;

        const hasCover = await coverExists(mapped.isbn);

        if (!hasCover) {
          skippedMissingCover++;
          continue;
        }

        const key = makeFetchDedupeKey(mapped);

        if (seen.has(key)) {
          skippedDuplicateFetch++;
          continue;
        }

        seen.add(key);
        collected.push(mapped);

        if (collected.length >= maxCandidates) {
          return collected;
        }
      }
    }

    // Stop if the whole round was empty
    if (!foundAnythingThisRound) {
      break;
    }
  }

  return collected;
}

// Find the next barcode sequence
async function getNextSequence(client: PoolClient): Promise<number> {
  const res = await client.query<{ barcode: string }>(
    `
    SELECT barcode
    FROM public.copies
    WHERE barcode ~ '^[0-9]{10}$'
    ORDER BY RIGHT(barcode, 6)::int DESC
    LIMIT 1
    `
  );

  if ((res.rowCount ?? 0) === 0) {
    return 1;
  }

  const barcode = res.rows[0].barcode;
  const lastSix = Number(barcode.slice(-6));

  return Number.isInteger(lastSix) ? lastSix + 1 : 1;
}

// Pick a branch
function pickBranchId(forcedBranch: BranchId | null): BranchId {
  if (forcedBranch) return forcedBranch;

  const branchIds: BranchId[] = [1, 2, 3, 4];
  return branchIds[Math.floor(Math.random() * branchIds.length)];
}

// Pick 1 to 3 copies
function getCopyCount(): number {
  return Math.floor(Math.random() * 3) + 1;
}

// Pick a copy status
function getConditionStatus(): "AVAILABLE" | "DAMAGED" | "MAINTENANCE" | "LOST" {
  const roll = Math.random();

  if (roll < 0.88) return "AVAILABLE";
  if (roll < 0.94) return "DAMAGED";
  if (roll < 0.99) return "MAINTENANCE";
  return "LOST";
}

// Turn genre into barcode code
function getGenreCode(genre: string): string {
  const normalized = genre.trim().toLowerCase();
  return GENRE_CODE_MAP[normalized] ?? "00";
}

// Build barcode: Branch = BB, Genre = GG, Incremented Sequence = SSSSSS; BBGGSSSSSS
function buildBarcode(branchId: BranchId, genre: string, sequence: number): string {
  const branchCode = BRANCH_ID_TO_CODE[branchId];
  const genreCode = getGenreCode(genre);
  const sequencePart = String(sequence).padStart(6, "0");

  return `${branchCode}${genreCode}${sequencePart}`;
}

// Write the seed log
async function appendSeedLog(stats: RunStats): Promise<void> {
  const logPath = path.resolve(process.cwd(), "db", "seed-books.log");

  const lines = [
    "----------------------------------------",
    `Time: ${new Date().toISOString()}`,
    `Requested books: ${stats.requested}`,
    `Candidate books: ${stats.candidateBooks}`,
    `Inserted books: ${stats.insertedBooks}`,
    `Inserted copies: ${stats.insertedCopies}`,
    `Skipped missing data: ${stats.skippedMissingData}`,
    `Skipped duplicate fetch: ${stats.skippedDuplicateFetch}`,
    `Skipped existing DB: ${stats.skippedExistingDb}`,
    `Skipped missing cover: ${stats.skippedMissingCover}`,
    "Inserted book details:",
    ...stats.insertedBookDetails.map(
      (book, index) => `${index + 1}. ${book.title} | ${book.isbn}`
    ),
    "",
  ].join("\n");

  await fs.appendFile(logPath, lines, "utf8");
}

// Main seed flow
async function main(): Promise<void> {
  const { count, branch } = parseArgs();

  console.log(`Starting seed run for ${count} books...`);

  const candidates = await collectCandidateBooks(count);

  console.log(`Collected ${candidates.length} candidate books.`);

  if (candidates.length === 0) {
    throw new Error("No valid candidate books were collected.");
  }

  let insertedBooks = 0;
  let insertedCopies = 0;
  let skippedExistingDb = 0;
  const insertedBookDetails: Array<{ title: string; isbn: string }> = [];

  const client = await pool.connect();

  try {
    let nextSequence = await getNextSequence(client);

    await client.query("BEGIN");

    for (const book of candidates) {
      if (insertedBooks >= count) break;

      const normalizedIsbn = normalizeIsbn(book.isbn);

      // Skip if the book already exists
      const existsRes = await client.query(
        `
        SELECT 1
        FROM public.books
        WHERE upper(regexp_replace(isbn, '[^0-9Xx]', '', 'g')) = $1
        LIMIT 1
        `,
        [normalizedIsbn]
      );

      if ((existsRes.rowCount ?? 0) > 0) {
        skippedExistingDb++;
        continue;
      }

      // Insert the book
      const insertBookRes = await client.query<{ book_id: string }>(
        `
        INSERT INTO public.books (
          isbn,
          title,
          author,
          genre,
          audience,
          description,
          publication_year,
          average_rating
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING book_id
        `,
        [
          book.isbn,
          book.title,
          book.author,
          book.genre,
          book.audience,
          book.description,
          book.publicationYear,
          book.averageRating,
        ]
      );

      const bookId = insertBookRes.rows[0].book_id;
      const copyCount = getCopyCount();

      // Add copies for this book
      for (let i = 0; i < copyCount; i++) {
        const branchId = pickBranchId(branch);
        const barcode = buildBarcode(branchId, book.genre, nextSequence++);
        const conditionStatus = getConditionStatus();

        await client.query(
          `
          INSERT INTO public.copies (book_id, barcode, condition_status, branch_id)
          VALUES ($1, $2, $3, $4)
          `,
          [bookId, barcode, conditionStatus, branchId]
        );

        insertedCopies++;
      }

      insertedBooks++;
      insertedBookDetails.push({
        title: book.title,
        isbn: book.isbn,
      });
    }

    await client.query("COMMIT");

    const stats: RunStats = {
      requested: count,
      candidateBooks: candidates.length,
      insertedBooks,
      insertedCopies,
      skippedMissingData,
      skippedDuplicateFetch,
      skippedExistingDb,
      skippedMissingCover,
      forcedBranch: branch,
      insertedBookDetails,
    };

    await appendSeedLog(stats);

    console.log("Seed run complete.");
    console.log(`Inserted books: ${insertedBooks}`);
    console.log(`Inserted copies: ${insertedCopies}`);
    console.log(`Skipped existing DB: ${skippedExistingDb}`);
    console.log(`Skipped missing data: ${skippedMissingData}`);
    console.log(`Skipped duplicate fetch: ${skippedDuplicateFetch}`);
    console.log(`Skipped missing cover: ${skippedMissingCover}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed. Changes were rolled back.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void main();