import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = name => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};

const inputPath = getArg('file');
let input = {};
if (inputPath) {
  input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
} else {
  input = {
    location: getArg('location'),
    report: getArg('report'),
    rating: getArg('rating'),
    submitted_at: getArg('submitted-at')
  };
}

for (const field of ['location', 'report']) {
  if (!input[field] || !String(input[field]).trim()) {
    console.error(`Missing required field: ${field}`);
    process.exit(1);
  }
}

const clean = value => String(value ?? '')
  .replace(/\r/g, '')
  .replace(/<[^>]*>/g, '')
  .trim();

const location = clean(input.location).slice(0, 120);
const report = clean(input.report).slice(0, 2000);
const rating = clean(input.rating || 'unrated').slice(0, 120);
const submittedAt = input.submitted_at ? new Date(input.submitted_at) : new Date();
const date = Number.isNaN(submittedAt.getTime()) ? new Date() : submittedAt;
const stamp = date.toISOString().replace(/[:.]/g, '-');
const slug = location.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'unknown-location';

const outputDir = path.resolve('submissions');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `${stamp}-${slug}.md`);
const yaml = value => JSON.stringify(value);

const body = `---\nstatus: approved\nsource: netlify-forms\nsubmitted_at: ${yaml(date.toISOString())}\nlocation: ${yaml(location)}\nrating: ${yaml(rating)}\n---\n\n# Blair sighting: ${location}\n\n${report}\n\n---\n\nReviewed for public archive. Real names, private addresses, contact details, and identifying information should be removed before committing.\n`;

fs.writeFileSync(outputPath, body, 'utf8');
console.log(`Archived approved submission: ${outputPath}`);
console.log(`Review the file, then run: git add ${JSON.stringify(outputPath)} && git commit -m "Archive reviewed Blair sighting"`);
