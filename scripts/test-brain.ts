/* Runs realistic visitor questions through the static brain and
   reports what it gets right, what it gets wrong, and what it
   refuses to answer.

   Run: npm run test:brain
   A miss is not automatically a failure — refusing is the safe
   behaviour. A confident WRONG answer is the real bug. */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createStaticBrain } from '../src/lib/brain/static.ts';
import type { Entry } from '../src/lib/brain/types.ts';

const DIR = 'src/content/knowledge';

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('no frontmatter');
  const [, fm, body] = match;
  const data: Record<string, unknown> = {};
  let key = '';
  for (const line of fm.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      const value = kv[2].trim();
      if (value.startsWith('[')) {
        data[key] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else if (value) {
        data[key] = value.replace(/^["']|["']$/g, '');
      } else {
        data[key] = [];
      }
    } else if (line.startsWith('  - ') && Array.isArray(data[key])) {
      (data[key] as string[]).push(line.slice(4).replace(/^["']|["']$/g, ''));
    }
  }
  return { data, body };
}

const entries: Entry[] = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const { data, body } = parseFrontmatter(readFileSync(join(DIR, file), 'utf8'));
    return {
      id: file.replace(/\.md$/, ''),
      question: String(data.question ?? ''),
      short: String(data.short ?? ''),
      aliases: (data.aliases as string[]) ?? [],
      group: String(data.group ?? ''),
      card: String(data.card ?? 'story'),
      featured: data.featured === 'true',
      order: Number(data.order ?? 0),
      followups: (data.followups as string[]) ?? [],
      hidden: false,
      html: '',
      text: body.replace(/[#*`>:\-]/g, ' '),
    } satisfies Entry;
  });

/** Realistic phrasings, each with the id it ought to land on. */
const CASES: [string, string][] = [
  ['what do you do', 'the-problem'],
  ['what is your job', 'the-problem'],
  ['what do you work on', 'the-problem'],
  ['whats an ai engineer', 'the-problem'],
  ['tell me about your work', 'the-problem'],
  ['are you hiring', 'working-with-me'],
  ['should i hire you', 'working-with-me'],
  ['are you available for work', 'working-with-me'],
  ['why should i hire you', 'working-with-me'],
  ['are you looking for a job', 'working-with-me'],
  ['show me your projects', 'receptionist'],
  ['what have you built', 'receptionist'],
  ['portfolio', 'receptionist'],
  ['what have you made', 'receptionist'],
  ['how do i contact you', 'talk-to-me'],
  ['email', 'talk-to-me'],
  ['can i reach you', 'talk-to-me'],
  ['whats your linkedin', 'talk-to-me'],
  ['what are you bad at', 'working-with-me'],
  ['what are your weaknesses', 'working-with-me'],
  ['what do you get wrong', 'working-with-me'],
  ['how do you work', 'how-i-work'],
  ['whats your process', 'how-i-work'],
  ['how do you approach problems', 'how-i-work'],
  ['what wont you build', 'how-i-work'],
  ['do you have ethics', 'how-i-work'],
  ['can ai be trusted', 'document-reader'],
  ['does ai make things up', 'document-reader'],
  ['what was hardest', 'receptionist'],
  ['whats the most difficult thing youve built', 'receptionist'],
  ['what goes wrong', 'the-problem'],
  ['does it understand accents', 'receptionist'],
  ['is this photo real', 'truthlens'],
];

const brain = createStaticBrain(entries);

let correct = 0;
const wrong: string[] = [];
const missed: string[] = [];

for (const [query, expected] of CASES) {
  const answer = await brain.ask(query);
  if (answer.kind === 'miss') {
    missed.push(`  "${query}"  →  refused (wanted ${expected})`);
  } else if (answer.entry!.id === expected) {
    correct++;
  } else {
    wrong.push(
      `  "${query}"  →  ${answer.entry!.id}  (wanted ${expected}, conf ${answer.confidence.toFixed(2)})`,
    );
  }
}

console.log(`\n  ${entries.length} entries, ${CASES.length} test questions\n`);
console.log(`  correct   ${correct}/${CASES.length}  (${Math.round((correct / CASES.length) * 100)}%)`);
console.log(`  wrong     ${wrong.length}`);
console.log(`  refused   ${missed.length}`);

if (wrong.length) console.log(`\n  WRONG — a confident bad answer is the real bug:\n${wrong.join('\n')}`);
if (missed.length) console.log(`\n  REFUSED — safe, but worth an alias:\n${missed.join('\n')}`);

// Nonsense must be refused, not answered.
console.log('\n  Nonsense handling:');
for (const q of ['asdkjfhaksjdfh', 'what is the capital of peru', 'buy cheap watches']) {
  const answer = await brain.ask(q);
  const ok = answer.kind === 'miss';
  console.log(`   ${ok ? 'refused ✓' : `ANSWERED ✗ (${answer.entry!.id})`}  "${q}"`);
}
console.log();
