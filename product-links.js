/*
 * Maintainer-owned registry for official product-link HTML.
 * Add only codes issued for this GAMEFINDER media, after checking the provider's
 * image/link conditions and the exact product/edition. Do not populate this from
 * search results, user input, URL parameters, or another site's affiliate code.
 * An empty registry intentionally displays no product cards.
 */
const GAME_PRODUCT_LINKS = {};

const GAME_PRODUCT_MEDIA_URL = "https://shikaku-route-jp.github.io/gamefinder/";

function gameProductEntry(game) {
  const entry = Object.hasOwn(GAME_PRODUCT_LINKS, game.title) ? GAME_PRODUCT_LINKS[game.title] : null;
  if (!entry || !["moshimo", "rakuten"].includes(entry.provider)) return null;
  if (entry.mediaUrl !== GAME_PRODUCT_MEDIA_URL || typeof entry.html !== "string" || !entry.html.trim()) return null;
  // This is a check of trusted configuration, not a sanitizer for untrusted HTML.
  if (/<(?:iframe|object|embed|form|base|meta|link)\b/i.test(entry.html)) return null;
  if (/<[^>]*\son[a-z]+\s*=/i.test(entry.html) || /javascript\s*:/i.test(entry.html)) return null;
  const hasImage = /<img\b/i.test(entry.html);
  const hasMoshimoCard = entry.provider === "moshimo" && /MoshimoAffiliateObject/.test(entry.html)
    && /dn\.msmstatic\.com\/site\/cardlink\//.test(entry.html) && /msmaflink/.test(entry.html);
  if (!hasImage && !hasMoshimoCard) return null;
  if (entry.provider === "rakuten" && /<script\b/i.test(entry.html)) return null;
  const providerLink = entry.provider === "rakuten" ? /(?:hb|hbb)\.afl\.rakuten\.co\.jp\// : /af\.moshimo\.com\/|dn\.msmstatic\.com\/site\/cardlink\//;
  return providerLink.test(entry.html) ? entry : null;
}

function gameProductMarkup(game, usedCodes) {
  const entry = gameProductEntry(game);
  if (!entry || usedCodes.has(entry.html)) return "";
  usedCodes.add(entry.html);
  // Keep the issued code intact, including the link destination and tracking.
  return '<aside class="game-product" aria-label="購入リンク"><p class="product-ad-label">広告 / PR</p>'
    + entry.html + '</aside>';
}

function activateGameProductScripts() {
  // innerHTML does not execute the official Moshimo card initializer. Recreate
  // only scripts inside configured product cards after their placeholders exist.
  document.querySelectorAll(".game-product script").forEach(original => {
    const script = document.createElement("script");
    for (const attribute of original.attributes) script.setAttribute(attribute.name, attribute.value);
    script.textContent = original.textContent;
    if (original.hasAttribute("src")) script.async = false;
    original.replaceWith(script);
  });
}
