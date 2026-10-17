import { describe, expect, test } from 'bun:test';
import { getAllPosts, getAllPages } from '../../src/lib/content/posts';
import { getAllBooks } from '../../src/lib/content/books';
import { getAllFlows } from '../../src/lib/content/flows';
import { getAllNotes } from '../../src/lib/content/notes';
import { getAllSeries } from '../../src/lib/content/series';
import { buildSlugRegistry } from '../../src/lib/content/discovery';
import { validateSiteConfig } from '../../src/lib/config-schema';
import { siteConfig } from '../../site.config';
import { generateStaticParams } from '../../src/app/[slug]/page';

describe('personal site content tree', () => {
  test('the live config satisfies the publishing schema', () => {
    expect(() => validateSiteConfig(siteConfig)).not.toThrow();
  });

  test('content discovery never includes isolated test documents', () => {
    const samples = new Set(['welcome-to-amytis', 'draft-post', 'sample-book', 'rst-legacy', 'zh-original-demo']);
    for (const item of [...getAllPosts(), ...getAllPages(), ...getAllBooks(), ...getAllFlows(), ...getAllNotes()]) {
      expect(samples.has(item.slug)).toBe(false);
    }
    for (const slug of Object.keys(getAllSeries())) expect(samples.has(slug)).toBe(false);
    for (const slug of buildSlugRegistry().keys()) expect(samples.has(slug)).toBe(false);
  });

  test('the static-page route remains exportable before any page is written', async () => {
    expect((await generateStaticParams()).length).toBeGreaterThan(0);
  });
});
