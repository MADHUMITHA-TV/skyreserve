/**
 * scripts/embedPolicies.js
 *
 * Reads every .md file in backend/policies/, splits each into chunks
 * (one per "## Heading" section), embeds each chunk locally, and stores
 * the result in PolicyChunk. Safe to re-run any time you edit the policy
 * docs — it clears old chunks for a source before re-inserting new ones.
 *
 * Run from backend/: node scripts/embedPolicies.js
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import prisma from "../src/config/database.js";
import { embedText } from "../src/modules/policy/embedding.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POLICIES_DIR = path.join(__dirname, "..", "policies");

/** Splits a markdown doc into { sectionTitle, content } chunks, one per
 * "## " heading. The top-level "# Title" line is dropped (not a chunk
 * on its own — it has no standalone answerable content). */
function chunkMarkdown(raw) {
  const lines = raw.split("\n");
  const chunks = [];
  let current = null;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (current) chunks.push(current);
      current = { sectionTitle: h2Match[1].trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
    // Lines before the first "## " (i.e. the "# Title" line and blanks)
    // are intentionally dropped.
  }
  if (current) chunks.push(current);

  return chunks
    .map((c) => ({ sectionTitle: c.sectionTitle, content: c.lines.join("\n").trim() }))
    .filter((c) => c.content.length > 0);
}

async function main() {
  const files = (await fs.readdir(POLICIES_DIR)).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.log(`No .md files found in ${POLICIES_DIR}`);
    return;
  }

  for (const file of files) {
    const raw = await fs.readFile(path.join(POLICIES_DIR, file), "utf-8");
    const chunks = chunkMarkdown(raw);

    console.log(`\n${file}: ${chunks.length} section(s)`);

    // Clear old chunks for this source so re-running is idempotent.
    await prisma.policyChunk.deleteMany({ where: { source: file } });

    for (let i = 0; i < chunks.length; i++) {
      const { sectionTitle, content } = chunks[i];
      // Prepending the heading to the embedded text improves retrieval
      // for queries that echo heading-like phrasing (e.g. "excess baggage").
      const embedding = await embedText(`${sectionTitle}\n${content}`);

      await prisma.policyChunk.create({
        data: { source: file, sectionTitle, chunkIndex: i, content, embedding }
      });

      console.log(`  [${i}] ${sectionTitle}`);
    }
  }

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());