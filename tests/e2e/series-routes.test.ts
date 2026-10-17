import { describe, test, expect } from 'bun:test';
import { getAllSeries, getSeriesData } from '../../src/lib/content/series';
import { getAllPosts } from '../../src/lib/content/posts';
import { getPostUrl, getSeriesUrl } from '../../src/lib/urls';
import { getTranslator } from '../../src/lib/i18n';
import { siteConfig } from '../../site.config';

const BASE_URL = 'http://localhost:3000';
const { t } = getTranslator(siteConfig.i18n.defaultLocale);
const sampleSeries = Object.keys(getAllSeries())[0];
const samplePost = getAllPosts().find(post => post.series);

async function isServerReady() {
  try {
    return (await fetch(`${BASE_URL}/series/`)).ok;
  } catch {
    return false;
  }
}

describe('E2E: Series Routes', () => {
  test('/series renders even without published series', async () => {
    if (!(await isServerReady())) throw new Error('Start the site before running E2E tests.');
    const response = await fetch(`${BASE_URL}/series/`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(t('series'));
  });

  test.skipIf(!sampleSeries)('a published series detail page is accessible', async () => {
    const response = await fetch(`${BASE_URL}${getSeriesUrl(sampleSeries)}`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(getSeriesData(sampleSeries)!.title);
  });

  test('unknown series returns 404', async () => {
    expect((await fetch(`${BASE_URL}/series/nonexistent-series-slug/`)).status).toBe(404);
  });

  test.skipIf(!samplePost)('a published series post uses its canonical URL', async () => {
    const response = await fetch(`${BASE_URL}${getPostUrl(samplePost!)}`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(samplePost!.title);
  });

  test('removed demo routes return 404', async () => {
    for (const route of ['/posts/welcome-to-amytis/', '/books/sample-book/', '/series/nextjs-deep-dive/']) {
      expect((await fetch(`${BASE_URL}${route}`)).status).toBe(404);
    }
  });
});
