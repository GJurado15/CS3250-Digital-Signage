import {
  summarize, formatFeedDate,
  stripTrailingSource, buildQrCodeUrl,
  getQuoteDayIndex, describeWeather, normalizeRssFeeds, normalizeRssProxies,
  isSafeRssItem
} from "./utils.js";

const configUrl = "config.json";

const logo = document.getElementById("logo");
const displayName = document.getElementById("display-name");
const timeText = document.getElementById("time-text");
const dateText = document.getElementById("date-text");
const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");
const clockTicks = document.getElementById("clock-ticks");
const weatherLabel = document.getElementById("weather-label");
const weatherTemp = document.getElementById("weather-temp");
const weatherDesc = document.getElementById("weather-desc");
const weatherIcon = document.getElementById("weather-icon");
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const rssSlider = document.getElementById("rss-slider");
const rssDots = document.getElementById("rss-dots");
const rssTemplate = document.getElementById("rss-item-template");

const watchThemes = ["watch--sector", "watch--diver", "watch--flieger", "watch--dress", "watch--field", "watch--chrono"];

let activeConfig;
let rssRefreshTimer;
let rssSlideInterval;

function fetchWithTimeout(url, options = {}, ms = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

buildClockTicks();
boot();

async function boot() {
  try {
    const [configRes, officeHoursRes] = await Promise.all([
      fetch(configUrl, { cache: "no-store" }),
      fetch("office-hours.json", { cache: "no-store" }).catch(() => null)
    ]);

    if (!configRes.ok) {
      throw new Error(`Unable to load ${configUrl}`);
    }

    activeConfig = await configRes.json();
    const officeHours = officeHoursRes?.ok ? await officeHoursRes.json() : {};

    applyBranding(activeConfig);
    renderOfficeHours(officeHours);
    applyWatchTheme(activeConfig.timezone || "America/Denver");
    startClock(activeConfig.timezone || "America/Denver");
    renderQuote(activeConfig.quotes);
    await Promise.allSettled([
      loadWeather(activeConfig.weather),
      loadRss(activeConfig.rss)
    ]);
  } catch (error) {
    console.error(error);
    renderRssFallback("Configuration could not be loaded.");
    weatherDesc.textContent = "Weather unavailable";
  }
}

function applyWatchTheme(timezone) {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("theme");
  const clock = document.querySelector(".analog-clock");

  let theme;
  if (forced && watchThemes.includes(`watch--${forced}`)) {
    theme = `watch--${forced}`;
  } else {
    const dayIndex = getQuoteDayIndex(timezone);
    theme = watchThemes[dayIndex % watchThemes.length];
  }

  watchThemes.forEach((t) => clock.classList.remove(t));
  clock.classList.add(theme);
}

function applyBranding(config) {
  document.title = config.pageTitle || "Digital Signage";
  logo.src = config.logoImage;
  displayName.textContent = config.displayName || "Your Name";
}

function renderOfficeHours(officeHours = {}) {
  const list = document.getElementById("office-hours-list");
  const locationEl = document.getElementById("office-hours-location");
  const schedule = Array.isArray(officeHours.schedule) ? officeHours.schedule : [];

  list.innerHTML = schedule.map(({ day, time }) => `
    <li class="office-hours-card__row">
      <span class="office-hours-card__day">${day}</span>
      <span class="office-hours-card__time">${time}</span>
    </li>`).join("");

  locationEl.textContent = officeHours.location || "";
}

function renderQuote(quotesConfig = {}) {
  const entries = Array.isArray(quotesConfig.items) ? quotesConfig.items : [];
  if (!entries.length) {
    quoteText.textContent = "";
    quoteAuthor.textContent = "";
    return;
  }

  const dayIndex = getQuoteDayIndex(activeConfig?.timezone || "America/Denver");
  const quote = entries[dayIndex % entries.length];

  quoteText.textContent = `"${quote.text}"`;
  quoteAuthor.textContent = quote.author && quote.author !== "No author"
    ? quote.author
    : "";
}

function startClock(timezone) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone
  });

  const updateClock = () => {
    const now = new Date();
    const zoned = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const hours = zoned.getHours();
    const minutes = zoned.getMinutes();
    const seconds = zoned.getSeconds();

    const hourRotation = (hours % 12) * 30 + minutes * 0.5;
    const minuteRotation = minutes * 6 + seconds * 0.1;
    const secondRotation = seconds * 6;

    hourHand.style.setProperty("--hand-angle", `${hourRotation}deg`);
    minuteHand.style.setProperty("--hand-angle", `${minuteRotation}deg`);
    secondHand.style.setProperty("--hand-angle", `${secondRotation}deg`);

    timeText.textContent = timeFormatter.format(now);
    dateText.textContent = dateFormatter.format(now);
  };

  updateClock();
  setInterval(updateClock, 1000);
}

function buildClockTicks() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 60; index += 1) {
    const tick = document.createElement("span");
    tick.style.setProperty("--tick-angle", `${index * 6}deg`);
    fragment.appendChild(tick);
  }
  clockTicks.appendChild(fragment);
}

async function loadWeather(weatherConfig = {}) {
  if (!weatherConfig.enabled) {
    weatherDesc.textContent = "Weather disabled";
    return;
  }

  weatherLabel.textContent = weatherConfig.label || "Weather";

  const params = new URLSearchParams({
    latitude: String(weatherConfig.latitude),
    longitude: String(weatherConfig.longitude),
    current: "temperature_2m,weather_code",
    temperature_unit: weatherConfig.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    timezone: weatherConfig.timezone || "auto"
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    const current = data.current;
    const tempUnit = weatherConfig.unit === "fahrenheit" ? "F" : "C";
    const description = describeWeather(current.weather_code);

    weatherTemp.textContent = `${Math.round(current.temperature_2m)}\u00B0${tempUnit}`;
    weatherDesc.textContent = description.label;
    weatherIcon.textContent = description.icon;
  } catch (error) {
    console.error(error);
    weatherDesc.textContent = "Weather unavailable";
  }
}

async function loadRss(rssConfig = {}) {
  const feeds = normalizeRssFeeds(rssConfig);
  scheduleRssRefresh(rssConfig);
  stopRssRotation();

  if (!feeds.length) {
    renderRssFallback("Add at least one RSS feed URL in config.json.");
    return;
  }

  const proxyTemplates = normalizeRssProxies(rssConfig);

  try {
    const feedResults = await Promise.allSettled(
      feeds.map((feed) => fetchRssFeed(feed, proxyTemplates))
    );

    const successfulFeeds = feedResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const maxPerFeed = Math.ceil(20 / Math.max(successfulFeeds.length, 1));
    const blockedTerms = Array.isArray(rssConfig.blockedTerms) ? rssConfig.blockedTerms : [];
    const allItems = successfulFeeds
      .flatMap((feedItems) =>
        feedItems
          .filter((item) => isSafeRssItem(item, blockedTerms))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxPerFeed)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

    if (!allItems.length) {
      renderRssFallback("No display-safe headlines available. Check the feed settings or blocked terms.");
      return;
    }

    const pages = [];
    for (let i = 0; i < allItems.length; i += 4) {
      pages.push(allItems.slice(i, i + 4));
    }

    renderRssPages(pages, rssConfig);

    if (pages.length > 1) {
      startRssRotation(pages.length);
    }

    // Fill in OG images after render — don't block content display
    fillOgImages(allItems, proxyTemplates);
  } catch (error) {
    console.error(error);
    renderRssFallback("RSS feeds unavailable. Check the feed URLs or proxy in config.json.");
  }
}

function scheduleRssRefresh(rssConfig) {
  if (rssRefreshTimer) {
    window.clearTimeout(rssRefreshTimer);
  }

  if (!rssConfig.refreshMinutes) {
    return;
  }

  rssRefreshTimer = window.setTimeout(
    () => loadRss(rssConfig),
    rssConfig.refreshMinutes * 60 * 1000
  );
}

function renderRssPages(pages, rssConfig) {
  rssSlider.style.transform = "translateY(0)";
  rssSlider.innerHTML = "";
  rssDots.innerHTML = "";

  pages.forEach((pageItems, pageIndex) => {
    const page = document.createElement("div");
    page.className = "rss-page";

    pageItems.forEach((item) => {
      const node = rssTemplate.content.firstElementChild.cloneNode(true);
      node.querySelector(".rss-item__title").textContent = item.title;
      node.querySelector(".rss-item__source").textContent = item.source;
      node.querySelector(".rss-item__date").textContent = formatFeedDate(item.dateValue);
      node.querySelector(".rss-item__summary").textContent = summarize(item.description, rssConfig.summaryLength || 170);

      const thumb = node.querySelector(".rss-item__thumb");
      const qrImage = node.querySelector(".rss-item__qr-image");

      if (item.image) {
        thumb.src = item.image;
        thumb.alt = item.title;
        thumb.classList.remove("rss-item__thumb--hidden");
        node.classList.add("rss-item--has-image");
        thumb.onerror = () => {
          thumb.classList.add("rss-item__thumb--hidden");
          node.classList.remove("rss-item--has-image");
        };
      }

      if (item.link) {
        node.dataset.link = item.link;
        qrImage.src = buildQrCodeUrl(item.link);
        qrImage.alt = `QR code for ${item.title}`;
      } else {
        qrImage.removeAttribute("src");
        qrImage.alt = "QR code unavailable";
      }

      page.appendChild(node);
    });

    rssSlider.appendChild(page);

    const dot = document.createElement("span");
    dot.className = "rss-dot" + (pageIndex === 0 ? " rss-dot--active" : "");
    rssDots.appendChild(dot);
  });
}

function startRssRotation(pageCount) {
  let currentPage = 0;
  rssSlideInterval = setInterval(() => {
    currentPage = (currentPage + 1) % pageCount;
    const viewportHeight = rssSlider.parentElement.clientHeight;
    rssSlider.style.transform = `translateY(-${currentPage * viewportHeight}px)`;
    rssDots.querySelectorAll(".rss-dot").forEach((dot, i) => {
      dot.classList.toggle("rss-dot--active", i === currentPage);
    });
  }, 15000);
}

function stopRssRotation() {
  if (rssSlideInterval) {
    clearInterval(rssSlideInterval);
    rssSlideInterval = null;
  }
}

async function fillOgImages(items, proxyTemplates) {
  await Promise.allSettled(
    items
      .filter((item) => !item.image && item.link)
      .map(async (item) => {
        const image = await fetchOgImage(item.link, proxyTemplates);
        if (!image) return;
        const node = rssSlider.querySelector(`[data-link="${CSS.escape(item.link)}"]`);
        if (!node) return;
        const thumb = node.querySelector(".rss-item__thumb");
        thumb.src = image;
        thumb.alt = item.title;
        thumb.classList.remove("rss-item__thumb--hidden");
        node.classList.add("rss-item--has-image");
        thumb.onerror = () => {
          thumb.classList.add("rss-item__thumb--hidden");
          node.classList.remove("rss-item--has-image");
        };
      })
  );
}

async function fetchRssFeed(feed, proxyTemplates) {
  let lastError;

  for (const proxyTemplate of proxyTemplates) {
    try {
      const feedUrl = proxyTemplate.replace("{url}", encodeURIComponent(feed.feedUrl));
      const response = await fetchWithTimeout(feedUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`RSS request failed with status ${response.status}`);
      }

      const text = await response.text();

      // Try JSON first (rss2json format)
      try {
        const json = JSON.parse(text);
        if (json.status === "ok" && Array.isArray(json.items)) {
          return json.items.map((item) => {
            const parsedDate = Date.parse(item.pubDate);
            const image =
              item.thumbnail ||
              (item.enclosure?.type?.startsWith("image/") ? item.enclosure.link : null) ||
              null;
            return {
              title: normalizeFeedText(item.title || "Untitled", 0) || "Untitled",
              source: feed.sourceName,
              dateValue: item.pubDate,
              timestamp: Number.isNaN(parsedDate) ? 0 : parsedDate,
              link: item.link || "",
              image,
              description: normalizeFeedText(item.description || item.content || "")
            };
          });
        }
      } catch {
        // Not JSON, fall through to XML parsing
      }

      // Try XML (standard RSS / Atom)
      const xml = new DOMParser().parseFromString(text, "text/xml");
      const parseError = xml.querySelector("parsererror");
      if (parseError) {
        throw new Error("Proxy returned invalid XML");
      }

      const entries = Array.from(xml.querySelectorAll("item, entry"));
      return entries.map((item) => {
        const dateValue =
          item.querySelector("pubDate")?.textContent ||
          item.querySelector("updated")?.textContent ||
          item.querySelector("published")?.textContent ||
          "";
        const parsedDate = Date.parse(dateValue);
        const titleData = extractFeedTitle(item, feed.sourceName);

        return {
          title: titleData.title,
          source: titleData.source,
          dateValue,
          timestamp: Number.isNaN(parsedDate) ? 0 : parsedDate,
          link: extractFeedLink(item),
          image: extractFeedImage(item),
          description:
            normalizeFeedText(
              item.querySelector("description")?.textContent ||
              item.querySelector("summary")?.textContent ||
              item.querySelector("content")?.textContent ||
              item.querySelector("content\\:encoded")?.textContent ||
              ""
            )
        };
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`RSS request failed for ${feed.feedUrl}: ${lastError?.message || "Unknown error"}`);
}

function renderRssFallback(message) {
  stopRssRotation();
  rssSlider.style.transform = "translateY(0)";
  rssSlider.innerHTML = "";
  rssDots.innerHTML = "";

  const page = document.createElement("div");
  page.className = "rss-page";

  for (let index = 0; index < 4; index += 1) {
    const node = rssTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".rss-item__title").textContent = "Waiting For Headlines";
    node.querySelector(".rss-item__source").textContent = "Feed";
    node.querySelector(".rss-item__date").textContent = "";
    node.querySelector(".rss-item__summary").textContent =
      index === 0
        ? message
        : "Update the feed settings to show live items here.";
    const qrImage = node.querySelector(".rss-item__qr-image");
    qrImage.removeAttribute("src");
    qrImage.alt = "QR code unavailable";
    qrImage.classList.add("rss-item__qr-image--empty");
    page.appendChild(node);
  }

  rssSlider.appendChild(page);
}

function extractFeedLink(item) {
  const atomLink = item.querySelector("link[href]")?.getAttribute("href");
  const rssLink = item.querySelector("link")?.textContent?.trim();
  return atomLink || rssLink || "";
}

async function fetchOgImage(articleUrl, proxyTemplates) {
  for (const proxyTemplate of proxyTemplates) {
    try {
      const proxyUrl = proxyTemplate.replace("{url}", encodeURIComponent(articleUrl));
      const response = await fetchWithTimeout(proxyUrl, { cache: "no-store" }, 5000);
      if (!response.ok) continue;
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const image =
        doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
        doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ||
        doc.querySelector('meta[name="og:image"]')?.getAttribute("content");
      if (image) return image;
    } catch {
      // try next proxy
    }
  }
  return null;
}

function extractFeedImage(item) {
  // Walk all child elements looking for media:content, media:thumbnail, or enclosure with image type
  for (const el of item.getElementsByTagName("*")) {
    const local = el.localName;
    if (local === "content" || local === "thumbnail") {
      const url = el.getAttribute("url");
      const medium = el.getAttribute("medium");
      const type = el.getAttribute("type") || "";
      if (url && (medium === "image" || type.startsWith("image/") || local === "thumbnail")) {
        return url;
      }
    }
    if (local === "enclosure") {
      const type = el.getAttribute("type") || "";
      const url = el.getAttribute("url");
      if (url && type.startsWith("image/")) return url;
    }
  }
  // Fallback: extract first <img src> from content body HTML (e.g. Verge/Atom feeds)
  for (const el of item.getElementsByTagName("*")) {
    const html = el.textContent || "";
    if (html.includes("<img")) {
      const match = html.match(/<img[^>]+src="([^"]+)"/i);
      if (match && match[1].startsWith("http")) return match[1];
    }
  }
  return null;
}

function extractFeedTitle(item, fallbackSource) {
  const rawTitle = normalizeFeedText(item.querySelector("title")?.textContent || "Untitled", 0) || "Untitled";
  const sourceFromFeed = normalizeFeedText(
    item.querySelector("source")?.textContent ||
    item.querySelector("source > title")?.textContent ||
    ""
  );

  if (sourceFromFeed) {
    return {
      title: stripTrailingSource(rawTitle, sourceFromFeed),
      source: sourceFromFeed
    };
  }

  const splitTitle = rawTitle.split(/\s+-\s+/);
  if (splitTitle.length > 1) {
    const trailingPart = splitTitle.at(-1);
    if (trailingPart && trailingPart.length <= 30) {
      return {
        title: splitTitle.slice(0, -1).join(" - "),
        source: trailingPart
      };
    }
  }

  return {
    title: rawTitle,
    source: fallbackSource
  };
}

function normalizeFeedText(text, minLength = 30) {
  // Decode HTML entities via a throwaway element, then strip any remaining tags
  const el = document.createElement("div");
  el.innerHTML = text.replace(/<[^>]*>/g, " ");
  const cleaned = el.textContent
    .replace(/https?:\/\/\S+/g, "")                                     // strip bare URLs
    .replace(/\b(Article\s*URL|Comments?\s*Url?|Points?)\s*:?\s*\d*/gi, "") // strip HN metadata
    .replace(/\s+&\s+/g, " ")                                           // strip orphaned ampersands
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // If what's left is too short to be real content (metadata remnants), discard it
  return cleaned.length < minLength ? "" : cleaned;
}


