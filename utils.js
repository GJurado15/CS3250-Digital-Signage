/**
 * @file utils.js
 * Pure utility functions for the digital signage app.
 * No DOM or network dependencies — safe to import in Node.js for testing.
 */

/**
 * Scores a headline for engagement quality. Higher scores surface more
 * interesting content in the lead slot.
 *
 * Scoring rules:
 * - +5 if the title contains a question mark
 * - +3 if the title starts with an exploratory word (why, how, what, etc.)
 * - +1 per matching "power word" (breakthrough, crisis, future, etc.)
 * - -5 per "boring signal" word (remembering, quarterly, obituary, etc.)
 *
 * @param {string} title - The raw headline text.
 * @returns {number} Engagement score (can be negative).
 */
export function scoreHeadline(title) {
  let score = 0;
  const t = title.toLowerCase();

  // Question format — strongest engagement signal
  if (t.includes("?")) score += 5;

  // Exploratory framing at the start of a title
  if (/^(why|how|what|when|where|can |should |will |is |are |does |do )/.test(t)) score += 3;

  // Engaging hooks and power words
  const hooks = [
    "breakthrough", "first", "never", "impossible", "finally", "actually",
    "secret", "revealed", "surprising", "unexpected", "mystery", "wrong",
    "discover", "real", "inside", "fear", "love", "hate", "crisis",
    "end of", "rise of", "death of", "future", "revolution", "warning",
    "new", "biggest", "worst", "best", "change"
  ];
  for (const w of hooks) {
    if (t.includes(w)) score += 1;
  }

  // Penalty for dry / institutional content
  const boring = [
    "remembering", "quarterly", "earnings", "devoted", "volunteer",
    "obituary", "in memoriam", "annual report", "press release",
    "advisory", "q1 ", "q2 ", "q3 ", "q4 "
  ];
  for (const w of boring) {
    if (t.includes(w)) score -= 5;
  }

  return score;
}

/**
 * Strips HTML tags from a string and truncates it to a maximum character
 * length, breaking only at word boundaries.
 *
 * @param {string} htmlLikeText - Raw text that may contain HTML markup.
 * @param {number} maxLength - Maximum number of characters to allow.
 * @returns {string} Plain text, truncated with "..." if it exceeded maxLength.
 */
export function summarize(htmlLikeText, maxLength) {
  const plainText = htmlLikeText
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const cut = plainText.slice(0, maxLength - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}

/**
 * Normalizes whitespace and truncates text based on an estimated line width.
 * Used for display elements where character-count limits approximate line wraps.
 *
 * @param {string} text - Input text to clamp.
 * @param {number} maxCharacters - Approximate max characters per line.
 * @returns {string} Normalized and possibly truncated text.
 */
export function clampLines(text, maxCharacters) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const limit = maxCharacters * 28;
  if (normalized.length <= limit) {
    return normalized;
  }
  const cut = normalized.slice(0, limit - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}

/**
 * Formats a feed date string into a human-readable relative time label.
 * Returns "" for missing or invalid dates.
 *
 * @param {string} dateValue - An ISO 8601 or RFC 2822 date string.
 * @returns {string} Relative label like "5m ago", "3h ago", "2d ago", or a
 *   short absolute date like "Apr 10" for items older than 7 days.
 */
export function formatFeedDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

/**
 * Derives a human-readable source name from a feed URL by extracting the
 * hostname and stripping the "www." prefix.
 *
 * @param {string} feedUrl - A fully-qualified feed URL.
 * @returns {string} The hostname (e.g. "arstechnica.com"), or "Feed" if the
 *   URL cannot be parsed.
 */
export function deriveSourceName(feedUrl) {
  try {
    return new URL(feedUrl).hostname.replace("www.", "");
  } catch {
    return "Feed";
  }
}

/**
 * Removes a trailing " - SourceName" suffix from an article title if present.
 * Many RSS feeds append their publication name to every title.
 *
 * @param {string} title - The raw article title.
 * @param {string} source - The source name to strip from the end.
 * @returns {string} The title without the trailing source suffix.
 */
export function stripTrailingSource(title, source) {
  const suffix = ` - ${source}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length).trim() : title;
}

/**
 * Builds a QR code image URL for a given article link using the qrserver API.
 *
 * @param {string} url - The article URL to encode.
 * @returns {string} A qrserver.com image URL that renders a 132×132 QR code.
 */
export function buildQrCodeUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(url)}`;
}

/**
 * Computes a stable daily index for quote rotation based on the current date
 * in the given timezone. The index changes each calendar day and is consistent
 * across page reloads within the same day.
 *
 * @param {string} timezone - An IANA timezone name (e.g. "America/Denver").
 * @returns {number} A positive integer that changes each day.
 */
export function getQuoteDayIndex(timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const [year, month, day] = formatter.format(new Date()).split("-");
  return Number.parseInt(year, 10) * 1000 + Number.parseInt(month, 10) * 50 + Number.parseInt(day, 10);
}

/**
 * Maps an Open-Meteo WMO weather interpretation code to a display label and
 * emoji icon. Falls back to a generic "Conditions unavailable" entry for
 * unrecognized codes.
 *
 * @param {number} code - WMO weather code from the Open-Meteo API.
 * @returns {{ icon: string, label: string }} Display object with emoji and text.
 */
export function describeWeather(code) {
  const weatherMap = {
    0: { icon: "\u2600", label: "CLEAR SKY" },
    1: { icon: "\uD83C\uDF24", label: "Mostly clear" },
    2: { icon: "\u26C5", label: "Partly cloudy" },
    3: { icon: "\u2601", label: "Overcast" },
    45: { icon: "\uD83C\uDF2B", label: "Fog" },
    48: { icon: "\uD83C\uDF2B", label: "Freezing fog" },
    51: { icon: "\uD83C\uDF26", label: "Light drizzle" },
    53: { icon: "\uD83C\uDF26", label: "Drizzle" },
    55: { icon: "\uD83C\uDF27", label: "Heavy drizzle" },
    61: { icon: "\uD83C\uDF26", label: "Light rain" },
    63: { icon: "\uD83C\uDF27", label: "Rain" },
    65: { icon: "\uD83C\uDF27", label: "Heavy rain" },
    71: { icon: "\uD83C\uDF28", label: "Light snow" },
    73: { icon: "\uD83C\uDF28", label: "Snow" },
    75: { icon: "\u2744", label: "Heavy snow" },
    80: { icon: "\uD83C\uDF26", label: "Rain showers" },
    81: { icon: "\uD83C\uDF27", label: "Heavy showers" },
    82: { icon: "\u26C8", label: "Violent showers" },
    95: { icon: "\u26C8", label: "Thunderstorm" },
    96: { icon: "\u26C8", label: "Storm with hail" },
    99: { icon: "\u26C8", label: "Severe hail storm" }
  };

  return weatherMap[code] || { icon: "\u2601", label: "Conditions unavailable" };
}

/**
 * Normalizes the feeds section of the RSS config into a consistent array of
 * feed descriptor objects. Accepts either a `feeds` array or a legacy single
 * `feedUrl` string on the config object.
 *
 * @param {object} rssConfig - The rss block from config.json.
 * @param {Array<{feedUrl: string, sourceName?: string}>} [rssConfig.feeds]
 * @param {string} [rssConfig.feedUrl]
 * @param {string} [rssConfig.sourceName]
 * @returns {Array<{feedUrl: string, sourceName: string}>} Normalized feed list.
 */
export function normalizeRssFeeds(rssConfig) {
  if (Array.isArray(rssConfig.feeds) && rssConfig.feeds.length) {
    return rssConfig.feeds
      .filter((feed) => feed && feed.feedUrl)
      .map((feed) => ({
        feedUrl: feed.feedUrl,
        sourceName: feed.sourceName || rssConfig.sourceName || deriveSourceName(feed.feedUrl)
      }));
  }

  if (rssConfig.feedUrl) {
    return [{
      feedUrl: rssConfig.feedUrl,
      sourceName: rssConfig.sourceName || deriveSourceName(rssConfig.feedUrl)
    }];
  }

  return [];
}

/**
 * Normalizes the proxies section of the RSS config into an array of proxy
 * URL templates. Each template should contain `{url}` as a placeholder.
 * Falls back to two public CORS proxies if none are configured.
 *
 * @param {object} rssConfig - The rss block from config.json.
 * @param {string[]} [rssConfig.proxies] - Array of proxy URL templates.
 * @param {string} [rssConfig.proxy] - Single legacy proxy URL template.
 * @returns {string[]} Array of proxy URL templates.
 */
export function normalizeRssProxies(rssConfig) {
  if (Array.isArray(rssConfig.proxies) && rssConfig.proxies.length) {
    return rssConfig.proxies;
  }

  if (rssConfig.proxy) {
    return [rssConfig.proxy];
  }

  return [
    "https://api.allorigins.win/raw?url={url}",
    "https://api.codetabs.com/v1/proxy?quest={url}"
  ];
}
