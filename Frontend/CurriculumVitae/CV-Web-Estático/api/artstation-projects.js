const ARTSTATION_RSS_URLS = [
  "https://www.artstation.com/nachoslkn/rss",
  "https://nachoslkn.artstation.com/rss"
];

function decodeXml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'");
}

function unwrapCdata(value = "") {
  return value
    .replace(/^\s*<!\[CDATA\[/, "")
    .replace(/\]\]>\s*$/, "")
    .trim();
}

function readTag(xml, tagName) {
  const escapedName = tagName.replace(":", "\\:");
  const match = xml.match(
    new RegExp(`<${escapedName}[^>]*>([\\s\\S]*?)<\\/${escapedName}>`, "i")
  );

  return match ? decodeXml(unwrapCdata(match[1])) : "";
}

function htmlToText(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImages(html = "") {
  const images = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = regex.exec(html))) {
    const url = decodeXml(match[1]);
    if (url && !images.includes(url)) images.push(url);
  }

  return images;
}

function parseFeed(xml) {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return items.map((item) => {
    const title = readTag(item, "title")
      .replace(/\s+by\s+Nacho\s+SLKN\s*$/i, "")
      .trim();

    const descriptionHtml = readTag(item, "description");
    const contentHtml = readTag(item, "content:encoded") || descriptionHtml;

    return {
      title,
      description: htmlToText(descriptionHtml),
      link: readTag(item, "link") || readTag(item, "guid"),
      pubDate: readTag(item, "pubDate"),
      images: extractImages(contentHtml)
    };
  });
}

async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Referer": "https://www.artstation.com/nachoslkn"
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function loadArtStationFeed() {
  const errors = [];

  for (const url of ARTSTATION_RSS_URLS) {
    try {
      const rssResponse = await fetchWithTimeout(url);
      const body = await rssResponse.text();

      if (!rssResponse.ok) {
        throw new Error(`HTTP ${rssResponse.status}`);
      }

      if (!/<(?:rss|feed)\b/i.test(body) || !/<item\b/i.test(body)) {
        throw new Error("La respuesta no parece un RSS válido");
      }

      const projects = parseFeed(body);

      if (!projects.length) {
        throw new Error("El RSS no contiene proyectos");
      }

      return { source: url, projects };
    } catch (error) {
      errors.push(`${url}: ${error?.message || String(error)}`);
    }
  }

  throw new Error(errors.join(" | "));
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { source, projects } = await loadArtStationFeed();

    response.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );

    return response.status(200).json({
      source,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error("ArtStation RSS error:", error);

    return response.status(502).json({
      error: "No se pudo leer el RSS de ArtStation",
      details: error?.message || String(error),
      projects: []
    });
  }
}
