import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '../public/artifacts');
const OUTPUT_FILE = path.join(__dirname, '../src/data/recent-decisions.json');
const ACD_TYPES = ['acdc', 'acde', 'acdt'];
const MAX_DECISIONS = 20;

// Each artifact dir is named "<date>_<number>", e.g. "2026-04-20_078".
function parseDirName(name) {
  const match = name.match(/^(\d{4}-\d{2}-\d{2})_(.+)$/);
  if (!match) return null;
  return { date: match[1], number: match[2] };
}

function compile() {
  const flat = [];

  for (const callType of ACD_TYPES) {
    const dir = path.join(ARTIFACTS_DIR, callType);
    if (!fs.existsSync(dir)) continue;

    for (const entry of fs.readdirSync(dir)) {
      const parsed = parseDirName(entry);
      if (!parsed) continue;
      const file = path.join(dir, entry, 'key_decisions.json');
      if (!fs.existsSync(file)) continue;

      let parsedJson;
      try {
        parsedJson = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (err) {
        console.warn(`Skipping ${file}: ${err.message}`);
        continue;
      }
      const decisions = parsedJson?.key_decisions;
      if (!Array.isArray(decisions)) continue;

      for (const decision of decisions) {
        flat.push({
          callType,
          callNumber: parsed.number,
          date: parsed.date,
          decision,
        });
      }
    }
  }

  // Most recent meetings first; preserve in-meeting order otherwise.
  flat.sort((a, b) => b.date.localeCompare(a.date));

  const trimmed = flat.slice(0, MAX_DECISIONS);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ recent: trimmed }, null, 2) + '\n');
  console.log(`✓ Compiled ${trimmed.length} recent decisions to ${OUTPUT_FILE}`);
}

compile();
