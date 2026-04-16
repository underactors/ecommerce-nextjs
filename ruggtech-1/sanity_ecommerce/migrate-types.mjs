/**
 * RUGGTECH Sanity Type Rename Migration
 * ======================================
 * Renames document _type values:
 *   agritechPage  →  agritech
 *   product2      →  headset
 *   phoneacc      →  accessories
 *
 * HOW TO RUN:
 *   1. Add your Sanity write token below (get it from sanity.io/manage → project → API → Tokens)
 *   2. From the sanity_ecommerce/ folder, run:
 *        node migrate-types.mjs
 *   3. The script will preview what it's going to do, then ask you to confirm before writing.
 *
 * SAFE: This only patches the _type field on each document. All other data is untouched.
 * After running, you also need to:
 *   - Update the schema name fields (see bottom of this file for instructions)
 *   - Update lib/sanity.ts ALL_TYPES array in the mobile app
 */

const PROJECT_ID = 'pb8lzqs5';
const DATASET    = 'production';
const TOKEN      = 'YOUR_WRITE_TOKEN_HERE'; // <-- paste your token here

const RENAMES = [
  { from: 'agritechPage', to: 'agritech' },
  { from: 'product2',     to: 'headset'  },
  { from: 'phoneacc',     to: 'accessories' },
];

const BASE = `https://${PROJECT_ID}.api.sanity.io/v2022-07-20/data`;

async function query(groq) {
  const url = `${BASE}/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.description || `Query failed: ${res.status}`);
  return json.result;
}

async function mutate(mutations) {
  const res = await fetch(`${BASE}/mutate/${DATASET}?returnIds=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.description || `Mutation failed: ${res.status}`);
  return json;
}

async function main() {
  if (TOKEN === 'YOUR_WRITE_TOKEN_HERE') {
    console.error('\n❌  Please add your Sanity write token to migrate-types.mjs before running.\n');
    process.exit(1);
  }

  console.log('\n🔍  Scanning documents to rename...\n');

  // Count documents per type first
  const summary = [];
  for (const { from, to } of RENAMES) {
    const docs = await query(`*[_type == "${from}"]{ _id, name }`);
    summary.push({ from, to, docs });
    console.log(`  ${from} → ${to}: ${docs.length} documents`);
    if (docs.length > 0) {
      docs.slice(0, 3).forEach(d => console.log(`    • ${d._id} — ${d.name || '(no name)'}`));
      if (docs.length > 3) console.log(`    … and ${docs.length - 3} more`);
    }
  }

  const total = summary.reduce((n, s) => n + s.docs.length, 0);
  if (total === 0) {
    console.log('\n✅  Nothing to migrate — all types are already up to date.\n');
    return;
  }

  console.log(`\n⚠️   About to rename ${total} documents. This cannot be undone automatically.`);
  console.log('    Type YES to proceed, anything else to abort:\n');

  // Read a line from stdin
  const answer = await new Promise(resolve => {
    process.stdout.write('> ');
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', d => resolve(d.trim()));
  });

  if (answer !== 'YES') {
    console.log('\n⛔  Aborted. No changes made.\n');
    process.exit(0);
  }

  // Run mutations in batches of 50
  for (const { from, to, docs } of summary) {
    if (docs.length === 0) continue;
    console.log(`\n  Migrating ${from} → ${to}...`);
    const BATCH = 50;
    for (let i = 0; i < docs.length; i += BATCH) {
      const batch = docs.slice(i, i + BATCH);
      const mutations = batch.map(doc => ({
        patch: {
          id: doc._id,
          set: { _type: to },
        },
      }));
      await mutate(mutations);
      console.log(`    ✓ Patched ${Math.min(i + BATCH, docs.length)} / ${docs.length}`);
    }
  }

  console.log('\n✅  Migration complete!\n');
  console.log('Next steps:');
  console.log('  1. In sanity_ecommerce/schemas/agritechPage.js  — change  name: "agritechPage"  to  name: "agritech"');
  console.log('  2. In sanity_ecommerce/schemas/product2.js      — change  name: "product2"      to  name: "headset"');
  console.log('  3. In sanity_ecommerce/schemas/phoneacc.js      — change  name: "phoneacc"      to  name: "accessories"');
  console.log('  4. Update the imports in sanity.config.ts (rename variables if you want)');
  console.log('  5. In ruggtech-mobile/lib/sanity.ts — update ALL_TYPES to use the new names');
  console.log('  6. Redeploy Sanity Studio: npx sanity deploy\n');
}

main().catch(err => {
  console.error('\n❌  Error:', err.message, '\n');
  process.exit(1);
});
