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
  ['what do you do', 'what-do-you-do'],
  ['what is your job', 'what-do-you-do'],
  ['what do you work on', 'what-do-you-do'],
  ['whats an ai engineer', 'what-do-you-do'],
  ['tell me about your work', 'what-do-you-do'],
  ['are you hiring', 'should-i-hire-you'],
  ['should i hire you', 'should-i-hire-you'],
  ['are you available for work', 'should-i-hire-you'],
  ['why should i hire you', 'should-i-hire-you'],
  ['are you looking for a job', 'should-i-hire-you'],
  ['show me your projects', 'show-me-something'],
  ['what have you built', 'show-me-something'],
  ['portfolio', 'show-me-something'],
  ['what have you made', 'show-me-something'],
  ['how do i contact you', 'talk-to-me'],
  ['email', 'talk-to-me'],
  ['can i reach you', 'talk-to-me'],
  ['whats your linkedin', 'talk-to-me'],
  ['where do you live', 'where-im-from'],
  ['are you in mumbai', 'where-im-from'],
  ['do you work remotely', 'where-im-from'],
  ['what are your hobbies', 'outside-of-work'],
  ['what do you do for fun', 'outside-of-work'],
  ['tell me about yourself outside work', 'outside-of-work'],
  ['what are you bad at', 'what-i-get-wrong'],
  ['what are your weaknesses', 'what-i-get-wrong'],
  ['what do you get wrong', 'what-i-get-wrong'],
  ['how do you work', 'how-i-work'],
  ['whats your process', 'how-i-work'],
  ['how do you approach problems', 'how-i-work'],
  ['is ai overhyped', 'ai-hype'],
  ['is ai a bubble', 'ai-hype'],
  ['whats your opinion on ai', 'ai-hype'],
  ['what wont you build', 'what-i-refuse-to-do'],
  ['do you have ethics', 'what-i-refuse-to-do'],
  ['can ai be trusted', 'reading-documents'],
  ['does ai make things up', 'reading-documents'],
  ['what was hardest', 'hardest-one'],
  ['whats the most difficult thing youve built', 'hardest-one'],
  ['how did you get into ai', 'how-did-you-get-here'],
  ['whats your background', 'how-did-you-get-here'],
  ['your education', 'how-did-you-get-here'],
  ['where are you headed', 'where-are-you-headed'],
  ['what are your goals', 'where-are-you-headed'],
  ['what goes wrong', 'three-am-problem'],
  ['does it understand accents', 'accents-question'],
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
