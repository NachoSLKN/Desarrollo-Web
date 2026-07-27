const ARTSTATION_RSS_URL = "https://nachoslkn.artstation.com/rss";

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
    .replace(/\s+/g, " ")
    .trim();
}

function extractImages(html = "") {
  const images = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = regex.exec(html))) {
    if (!images.includes(match[1])) images.push(match[1]);
  }

  return images;
}

function parseFeed(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  return items.map((item) => {
    const title = readTag(item, "title")
      .replace(/\s+by\s+Nacho\s+SLKN\s*$/i, "")
      .trim();
    const descriptionHtml = readTag(item, "description");
    const contentHtml = readTag(item, "content:encoded");

    return {
      title,
      description: htmlToText(descriptionHtml),
      link: readTag(item, "link") || readTag(item, "guid"),
      pubDate: readTag(item, "pubDate"),
      images: extractImages(contentHtml)
    };
  });
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rssResponse = await fetch(ARTSTATION_RSS_URL, {
      headers: {
        "User-Agent": "NachoSLKN-Portfolio/1.0"
      }
    });

    if (!rssResponse.ok) {
      throw new Error(`ArtStation respondió con ${rssResponse.status}`);
    }

    const xml = await rssResponse.text();
    const projects = parseFeed(xml);

    response.setHeader(
      "Cache-Control",
      "public, s-maxage=900, stale-while-revalidate=86400"
    );

    return response.status(200).json({
      source: ARTSTATION_RSS_URL,
      projects
    });
  } catch (error) {
    console.error("ArtStation RSS error:", error);
    return response.status(502).json({
      error: "No se pudo leer el RSS de ArtStation",
      projects: []
    });
  }
}
