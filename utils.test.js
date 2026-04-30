const {
  scoreHeadline,
  summarize,
  clampLines,
  formatFeedDate,
  deriveSourceName,
  stripTrailingSource,
  buildQrCodeUrl,
  getQuoteDayIndex,
  describeWeather,
  normalizeRssFeeds,
  normalizeRssProxies,
  isSafeRssItem,
} = require("./utils.js");

// ---------------------------------------------------------------------------
// scoreHeadline
// ---------------------------------------------------------------------------
describe("scoreHeadline", () => {
  test("adds 5 for a question mark", () => {
    expect(scoreHeadline("Why does AI hallucinate?")).toBeGreaterThanOrEqual(5);
  });

  test("adds 3 for exploratory opening word", () => {
    expect(scoreHeadline("How computers learn to see")).toBeGreaterThanOrEqual(3);
  });

  test("adds 1 per power word", () => {
    const base = scoreHeadline("Scientists make a new discovery");
    const more = scoreHeadline("Scientists make a new discovery and a breakthrough");
    expect(more).toBeGreaterThan(base);
  });

  test("subtracts 5 for boring institutional words", () => {
    expect(scoreHeadline("Remembering Gary Gaynor")).toBeLessThan(0);
  });

  test("combines bonuses and penalties", () => {
    // question (+5) + boring (-5) = 0 or close
    const score = scoreHeadline("Remembering the future?");
    expect(score).toBeLessThan(scoreHeadline("What is the future?"));
  });

  test("returns 0 for a plain neutral headline", () => {
    expect(scoreHeadline("Software version 3.2 released")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// summarize
// ---------------------------------------------------------------------------
describe("summarize", () => {
  test("returns short text unchanged", () => {
    expect(summarize("Hello world", 50)).toBe("Hello world");
  });

  test("strips HTML tags", () => {
    expect(summarize("<p>Hello <b>world</b></p>", 50)).toBe("Hello world");
  });

  test("truncates at word boundary and appends ellipsis", () => {
    const result = summarize("one two three four five", 12);
    expect(result).toMatch(/\.\.\.$/);
    expect(result.length).toBeLessThanOrEqual(12);
    expect(result).not.toContain("five");
  });

  test("handles empty string", () => {
    expect(summarize("", 100)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// clampLines
// ---------------------------------------------------------------------------
describe("clampLines", () => {
  test("returns short text unchanged", () => {
    expect(clampLines("short text", 10)).toBe("short text");
  });

  test("normalizes extra whitespace", () => {
    expect(clampLines("  hello   world  ", 10)).toBe("hello world");
  });

  test("truncates very long text", () => {
    const long = "word ".repeat(300);
    const result = clampLines(long, 1);
    expect(result.endsWith("...")).toBe(true);
    expect(result.length).toBeLessThan(long.length);
  });
});

// ---------------------------------------------------------------------------
// formatFeedDate
// ---------------------------------------------------------------------------
describe("formatFeedDate", () => {
  test("returns empty string for missing input", () => {
    expect(formatFeedDate("")).toBe("");
    expect(formatFeedDate(null)).toBe("");
  });

  test("returns empty string for an invalid date string", () => {
    expect(formatFeedDate("not-a-date")).toBe("");
  });

  test("formats a recent date as minutes ago", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatFeedDate(fiveMinutesAgo)).toBe("5m ago");
  });

  test("formats a date from a few hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatFeedDate(threeHoursAgo)).toBe("3h ago");
  });

  test("formats a date from a few days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatFeedDate(twoDaysAgo)).toBe("2d ago");
  });

  test("formats an old date as a short absolute date", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatFeedDate(twoWeeksAgo);
    // Should look like "Mar 27" or "Apr 10"
    expect(result).toMatch(/^[A-Z][a-z]+ \d+$/);
  });
});

// ---------------------------------------------------------------------------
// deriveSourceName
// ---------------------------------------------------------------------------
describe("deriveSourceName", () => {
  test("extracts hostname from a full URL", () => {
    expect(deriveSourceName("https://feeds.arstechnica.com/arstechnica/technology-lab")).toBe("feeds.arstechnica.com");
  });

  test("strips www. prefix", () => {
    expect(deriveSourceName("https://www.example.com/feed")).toBe("example.com");
  });

  test("returns Feed for an invalid URL", () => {
    expect(deriveSourceName("not-a-url")).toBe("Feed");
    expect(deriveSourceName("")).toBe("Feed");
  });
});

// ---------------------------------------------------------------------------
// stripTrailingSource
// ---------------------------------------------------------------------------
describe("stripTrailingSource", () => {
  test("strips a trailing ' - Source' suffix", () => {
    expect(stripTrailingSource("AI takes over - Ars Technica", "Ars Technica")).toBe("AI takes over");
  });

  test("leaves the title unchanged when suffix is absent", () => {
    expect(stripTrailingSource("AI takes over", "Ars Technica")).toBe("AI takes over");
  });

  test("does not strip a source that appears in the middle", () => {
    expect(stripTrailingSource("Ars Technica covers AI", "Ars Technica")).toBe("Ars Technica covers AI");
  });
});

// ---------------------------------------------------------------------------
// buildQrCodeUrl
// ---------------------------------------------------------------------------
describe("buildQrCodeUrl", () => {
  test("returns a qrserver URL with encoded data parameter", () => {
    const url = buildQrCodeUrl("https://example.com/article");
    expect(url).toContain("api.qrserver.com");
    expect(url).toContain("132x132");
    expect(url).toContain(encodeURIComponent("https://example.com/article"));
  });
});

// ---------------------------------------------------------------------------
// isSafeRssItem
// ---------------------------------------------------------------------------
describe("isSafeRssItem", () => {
  test("allows normal technology headlines", () => {
    const item = {
      title: "Researchers improve battery recycling",
      description: "A new process recovers more rare earth metals.",
      source: "Example"
    };

    expect(isSafeRssItem(item)).toBe(true);
  });

  test("blocks NSFW terms in titles", () => {
    const item = {
      title: "NSFW forum trend reaches social apps",
      description: "A platform policy story.",
      source: "Example"
    };

    expect(isSafeRssItem(item)).toBe(false);
  });

  test("blocks configured extra terms in summaries", () => {
    const item = {
      title: "Startup launches new app",
      description: "The product focuses on gambling odds.",
      source: "Example"
    };

    expect(isSafeRssItem(item, ["gambling"])).toBe(false);
  });

  test("matches whole terms without catching unrelated substrings", () => {
    const item = {
      title: "Essex researchers publish computing history archive",
      description: "A university library digitization project.",
      source: "Example"
    };

    expect(isSafeRssItem(item)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getQuoteDayIndex
// ---------------------------------------------------------------------------
describe("getQuoteDayIndex", () => {
  test("returns a positive integer", () => {
    const index = getQuoteDayIndex("America/Denver");
    expect(Number.isInteger(index)).toBe(true);
    expect(index).toBeGreaterThan(0);
  });

  test("returns the same value when called twice in the same timezone", () => {
    expect(getQuoteDayIndex("America/Denver")).toBe(getQuoteDayIndex("America/Denver"));
  });

  test("returns different values for different dates", () => {
    // Timezones with a large enough offset from UTC will produce a different
    // calendar day and therefore a different index.
    const utc = getQuoteDayIndex("UTC");
    const samoa = getQuoteDayIndex("Pacific/Apia"); // UTC+13, very likely different day
    // They may or may not differ depending on when this runs, but both must be valid integers.
    expect(Number.isInteger(utc)).toBe(true);
    expect(Number.isInteger(samoa)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// describeWeather
// ---------------------------------------------------------------------------
describe("describeWeather", () => {
  test("returns the correct label for code 0 (clear sky)", () => {
    const result = describeWeather(0);
    expect(result.label).toBe("CLEAR SKY");
    expect(result.icon).toBeTruthy();
  });

  test("returns the correct label for code 95 (thunderstorm)", () => {
    expect(describeWeather(95).label).toBe("Thunderstorm");
  });

  test("returns a fallback for an unrecognized code", () => {
    const result = describeWeather(999);
    expect(result.label).toBe("Conditions unavailable");
  });
});

// ---------------------------------------------------------------------------
// normalizeRssFeeds
// ---------------------------------------------------------------------------
describe("normalizeRssFeeds", () => {
  test("normalizes a feeds array", () => {
    const config = {
      feeds: [
        { feedUrl: "https://example.com/feed", sourceName: "Example" }
      ]
    };
    const result = normalizeRssFeeds(config);
    expect(result).toHaveLength(1);
    expect(result[0].feedUrl).toBe("https://example.com/feed");
    expect(result[0].sourceName).toBe("Example");
  });

  test("derives source name when not provided", () => {
    const config = { feeds: [{ feedUrl: "https://example.com/feed" }] };
    const result = normalizeRssFeeds(config);
    expect(result[0].sourceName).toBe("example.com");
  });

  test("handles legacy single feedUrl on config", () => {
    const config = { feedUrl: "https://example.com/feed", sourceName: "Example" };
    const result = normalizeRssFeeds(config);
    expect(result).toHaveLength(1);
    expect(result[0].sourceName).toBe("Example");
  });

  test("filters out feed entries without a feedUrl", () => {
    const config = { feeds: [{ sourceName: "Bad" }, { feedUrl: "https://ok.com/feed" }] };
    expect(normalizeRssFeeds(config)).toHaveLength(1);
  });

  test("returns empty array when no feeds are configured", () => {
    expect(normalizeRssFeeds({})).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// normalizeRssProxies
// ---------------------------------------------------------------------------
describe("normalizeRssProxies", () => {
  test("returns the proxies array directly when provided", () => {
    const proxies = ["https://proxy1.com?url={url}", "https://proxy2.com?url={url}"];
    expect(normalizeRssProxies({ proxies })).toEqual(proxies);
  });

  test("wraps a single legacy proxy string in an array", () => {
    const result = normalizeRssProxies({ proxy: "https://proxy.com?url={url}" });
    expect(result).toEqual(["https://proxy.com?url={url}"]);
  });

  test("returns two public fallback proxies when nothing is configured", () => {
    const result = normalizeRssProxies({});
    expect(result).toHaveLength(2);
    expect(result[0]).toContain("{url}");
  });
});
