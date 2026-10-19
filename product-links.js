/*
 * Maintainer-owned registry for official Rakuten Affiliate image-link HTML.
 * GAMEFINDER does not use Moshimo; Moshimo remains for Qualification Route only.
 * Add only codes issued for this GAMEFINDER media, after checking the provider's
 * image/link conditions and the exact product/edition. Do not populate this from
 * search results, user input, URL parameters, or another site's affiliate code.
 * An empty registry intentionally displays no product cards.
 */
const GAME_PRODUCT_LINKS = {};

const GAME_PRODUCT_MEDIA_URL = "https://shikaku-route-jp.github.io/gamefinder/";

// A deliberately narrow check for static, maintainer-reviewed provider HTML.
// Reject an unsupported format instead of rewriting any part of the issued code.
function gameProductHtmlAllowed(html) {
  const tags = html.match(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g) || [];
  if (html.replace(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g, "").includes("<")) return false;
  const allowedTags = new Set(["a", "img", "div", "span", "p", "br", "table", "tbody", "tr", "td", "b", "strong", "small"]);
  const allowedAttributes = new Set(["href", "src", "alt", "title", "style", "target", "rel", "width", "height", "border", "cellpadding", "cellspacing", "align", "valign"]);
  const affiliateUrl = /^https:\/\/(?:hb|hbb)\.afl\.rakuten\.co\.jp\//i;
  const imageUrl = /^https:\/\/(?:thumbnail\.image\.rakuten\.co\.jp|(?:hb|hbb)\.afl\.rakuten\.co\.jp)\//i;
  const stack = [];
  let linkedImages = 0;
  for (const tag of tags) {
    const match = /^<(\/)?([a-z][a-z0-9]*)([\s\S]*?)>$/i.exec(tag);
    if (!match) return false;
    const name = match[2].toLowerCase();
    if (!allowedTags.has(name)) return false;
    if (match[1]) {
      if (match[3].trim() || stack.pop() !== name) return false;
      continue;
    }
    let rest = match[3];
    const attributes = new Map();
    while (rest.trim() && rest.trim() !== "/") {
      const attr = /^\s+([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(rest);
      if (!attr) return false;
      const key = attr[1].toLowerCase(), value = attr[2] ?? attr[3] ?? attr[4];
      if (!allowedAttributes.has(key) || attributes.has(key)) return false;
      if (key === "href" && name !== "a" || key === "src" && name !== "img") return false;
      // Entity-encoded or escaped CSS is unsupported, as are external CSS loads.
      if (key === "style" && /[&\\]|url\s*\(|expression\s*\(|@/i.test(value)) return false;
      attributes.set(key, value);
      rest = rest.slice(attr[0].length);
    }
    if (name === "a") {
      const href = attributes.get("href") || "";
      if (stack.includes("a") || !affiliateUrl.test(href) || /[\s\\]/.test(href)) return false;
    }
    if (name === "img") {
      const src = attributes.get("src") || "";
      if (!imageUrl.test(src) || /[\s\\]/.test(src)) return false;
      if (stack.includes("a")) linkedImages++;
    }
    if (name !== "img" && name !== "br") {
      if (rest.trim() === "/") return false;
      stack.push(name);
    }
  }
  return stack.length === 0 && linkedImages > 0;
}

function gameProductEntry(game) {
  const entry = Object.hasOwn(GAME_PRODUCT_LINKS, game.title) ? GAME_PRODUCT_LINKS[game.title] : null;
  if (!entry || entry.provider !== "rakuten") return null;
  if (entry.mediaUrl !== GAME_PRODUCT_MEDIA_URL || typeof entry.html !== "string" || !entry.html.trim()) return null;
  // This cannot prove account ownership, site registration, or image permission.
  return gameProductHtmlAllowed(entry.html) ? entry : null;
}

function gameProductMarkup(game, usedCodes) {
  const entry = gameProductEntry(game);
  if (!entry || usedCodes.has(entry.html)) return "";
  usedCodes.add(entry.html);
  // Keep the issued code intact, including the link destination and tracking.
  return '<aside class="game-product" aria-label="楽天市場の購入リンク"><p class="product-ad-label">広告 / PR・楽天市場</p>'
    + entry.html + '</aside>';
}

