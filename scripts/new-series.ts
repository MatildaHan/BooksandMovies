import fs from 'fs';
import path from 'path';
import { slugifyGithub } from './lib/slug';
import { isoDateStamp, yamlDoubleQuoted } from './lib/content-file';

const args = process.argv.slice(2);
const title = args[0];

if (!title) {
  console.error('Please provide a series title.');
  console.error('Usage: bun run new-series "My Series Name"');
  process.exit(1);
}

const slug = slugifyGithub(title);
const seriesDir = path.join(process.cwd(), 'content', 'series', slug);

if (fs.existsSync(seriesDir)) {
  console.error(`Series "${slug}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(seriesDir, { recursive: true });
fs.mkdirSync(path.join(seriesDir, 'images'));

const date = isoDateStamp();

const content = `---
title: "${yamlDoubleQuoted(title)}"
excerpt: ""
date: "${date}"
---

`;

fs.writeFileSync(path.join(seriesDir, 'index.mdx'), content);

console.log(`Created new series at content/series/${slug}/index.mdx`);
