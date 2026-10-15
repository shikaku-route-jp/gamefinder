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

function gameProductEntry(game) {
  const entry = Object.hasOwn(GAME_PRODUCT_LINKS, game.title) ? GAME_PRODUCT_LINKS[game.title] : null;
  if (!entry || entry.provider !== "rakuten") return null;
  if (entry.mediaUrl !== GAME_PRODUCT_MEDIA_URL || typeof entry.html !== "string" || !entry.html.trim()) return null;
  // This is a check of trusted configuration, not a sanitizer for untrusted HTML.
  if (/<(?:script|iframe|object|embed|form|base|meta|link)\b/i.test(entry.html)) return null;
  if (/<[^>]*\son[a-z]+\s*=/i.test(entry.html) || /javascript\s*:/i.test(entry.html)) return null;
  if (!/<img\b/i.test(entry.html)) return null;
  return /(?:hb|hbb)\.afl\.rakuten\.co\.jp\//.test(entry.html) ? entry : null;
}

function gameProductMarkup(game, usedCodes) {
  const entry = gameProductEntry(game);
  if (!entry || usedCodes.has(entry.html)) return "";
  usedCodes.add(entry.html);
  // Keep the issued code intact, including the link destination and tracking.
  return '<aside class="game-product" aria-label="購入リンク"><p class="product-ad-label">広告 / PR</p>'
    + entry.html + '</aside>';
}

