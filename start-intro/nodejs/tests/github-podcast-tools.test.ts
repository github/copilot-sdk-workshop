import assert from "node:assert/strict";
import { test } from "node:test";
import { getEpisode, getLatestEpisodes } from "../src/github-podcast-tools.js";

const feedUrl = "https://feeds.simplecast.com/ioCY0vfY";

function episode(title: string, description: string): string {
  return `<item>
    <title>${title}</title>
    <pubDate>Fri, 20 Mar 2026 12:00:00 GMT</pubDate>
    <itunes:duration>00:30:00</itunes:duration>
    <description>${description}</description>
    <link>https://example.com/episode?a=1&amp;b=2</link>
  </item>`;
}

function feed(items: string): string {
  return `<?xml version="1.0"?>
    <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
      <channel>${items}</channel>
    </rss>`;
}

test("reads episode metadata and converts CDATA HTML to plain text", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch", async (
    input: Parameters<typeof fetch>[0], options: Parameters<typeof fetch>[1],
  ) => {
    assert.equal(input, feedUrl);
    assert.ok(options?.signal instanceof AbortSignal);
    assert.equal(options.signal.aborted, false);
    return new Response(feed(episode(
      "42: GitHub &amp; Copilot",
      '<![CDATA[<p>Build &amp; learn &#39;together&#39; &#x1F680;.</p>]]>',
    )));
  });

  assert.deepEqual(await getEpisode(), {
    episodeNumber: 42,
    title: "42: GitHub & Copilot",
    published: "Fri, 20 Mar 2026 12:00:00 GMT",
    duration: "00:30:00",
    description: "Build & learn 'together' \u{1F680}.",
    episodeUrl: "https://example.com/episode?a=1&b=2",
    sourceFeedUrl: feedUrl,
  });
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("handles escaped HTML and CDATA without recursively decoding entities", async (context) => {
  context.mock.method(globalThis, "fetch", async () => new Response(feed([
    episode("1: &amp;lt;literal&amp;gt;",
      "<![CDATA[<p>&amp;lt;tag&amp;gt; &amp;#39;</p>]]>"),
    episode("2: Escaped HTML",
      "&lt;p&gt;A &amp;amp; B &amp;#39;quoted&amp;#39;&lt;/p&gt;"),
    episode("3: Mixed XML and CDATA",
      "Before &amp; <![CDATA[<b>after &amp;lt;tag&amp;gt;</b>]]>"),
  ].join(""))));

  const episodes = await getLatestEpisodes();
  assert.equal(episodes[0]?.title, "1: &lt;literal&gt;");
  assert.equal(episodes[0]?.description, "&lt;tag&gt; &#39;");
  assert.equal(episodes[1]?.description, "A & B 'quoted'");
  assert.equal(episodes[2]?.description, "Before & after &lt;tag&gt;");
});

test("ignores script and style contents, including mixed-case and malformed HTML", async (context) => {
  context.mock.method(globalThis, "fetch", async () => new Response(feed([
    episode("1: Scripts",
      '<![CDATA[<p>Safe</p><ScRiPt>bad <script data-x=">">still bad</ScRiPt><STYLE>bad css</STYLE><p> text</p>]]>'),
    episode("2: Unclosed script", "<![CDATA[<p>Keep</p><script>discard the rest]]>"),
    episode("3: Malformed tags", '<![CDATA[<p title=">">Readable</p><!----><br> text]]>'),
  ].join(""))));

  assert.deepEqual((await getLatestEpisodes()).map(({ description }) => description),
    ["Safe text", "Keep", "Readable text"]);
});

test("returns only the ten newest episodes and matches titles case-insensitively", async (context) => {
  const items = Array.from({ length: 12 }, (_, index) =>
    episode(`${index + 1}: GitHub &amp; Copilot`, "<![CDATA[<p>Episode</p>]]>")).join("");
  context.mock.method(globalThis, "fetch", async () => new Response(feed(items)));

  const episodes = await getLatestEpisodes();
  assert.equal(episodes.length, 10);
  assert.deepEqual(episodes.map(({ episodeNumber }) => episodeNumber),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal((await getEpisode("11: github & copilot")).episodeNumber, 11);
  await assert.rejects(getEpisode("Unknown episode"), /was not found/);
});

test("reports empty feeds and HTTP failures", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch",
    async () => new Response(feed("")));
  assert.deepEqual(await getLatestEpisodes(), []);
  await assert.rejects(getEpisode(), /contained no episodes/);
  fetchMock.mock.mockImplementation(async () => new Response(null, { status: 503 }));
  await assert.rejects(getLatestEpisodes(), /RSS feed: 503/);
  await assert.rejects(getEpisode(), /RSS feed: 503/);
});
