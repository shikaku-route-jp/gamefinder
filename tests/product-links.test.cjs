const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "..", "product-links.js"), "utf8");
// Synthetic markup only: these URLs are never fetched or used as real products.
const html = '<a href="https://hb.afl.rakuten.co.jp/hgc/test-only/"><img src="https://thumbnail.image.rakuten.co.jp/test-only.jpg" width="128" height="128" alt="fixture"></a>';

function setup() {
  const context = vm.createContext({ document: { querySelectorAll: () => [] } });
  vm.runInContext(source, context);
  const run = code => vm.runInContext(code, context);
  context.fixtureHtml = html;
  run('const game={title:"fixture"}; const codes=new Set();');
  return { context, run, register: () => run('GAME_PRODUCT_LINKS.fixture={provider:"rakuten",mediaUrl:GAME_PRODUCT_MEDIA_URL,html:fixtureHtml}') };
}

test("unconfigured results do not add product markup or invent image permissions", () => {
  const app = setup();
  assert.equal(app.run("Object.keys(GAME_PRODUCT_LINKS).length"), 0);
  assert.equal(app.run("gameProductMarkup(game,codes)"), "");
});

test("preserves the issued image/link HTML and labels the product as advertising", () => {
  const app = setup(); app.register();
  const result = app.run("gameProductMarkup(game,codes)");
  assert.ok(result.includes(html));
  assert.ok(result.includes("広告 / PR"));
});

test("a different site's affiliate configuration does not appear on GAMEFINDER", () => {
  const app = setup(); app.register();
  app.run('GAME_PRODUCT_LINKS.fixture.mediaUrl="https://example.test/other-site/"');
  assert.equal(app.run("gameProductMarkup(game,codes)"), "");
});

test("matches exact catalog titles and does not resolve inherited object keys", () => {
  const app = setup(); app.register();
  assert.equal(app.run('gameProductMarkup({title:"different edition"},codes)'), "");
  assert.equal(app.run('gameProductMarkup({title:"toString"},codes)'), "");
});

test("does not insert the same generated code twice in one result", () => {
  const app = setup(); app.register();
  assert.ok(app.run("gameProductMarkup(game,codes)"));
  assert.equal(app.run("gameProductMarkup(game,codes)"), "");
  assert.ok(app.run("gameProductMarkup(game,new Set())"));
});

test("rejects clear configuration mistakes rather than executing arbitrary supplied markup", () => {
  for (const badHtml of ['<form><img></form>', '<a href="javascript:alert(1)"><img></a>', '<img onerror="alert(1)">', html+'<script>alert(1)</script>', '<img src="https://example.test/a.jpg">']) {
    const app = setup(); app.register(); app.context.badHtml = badHtml;
    app.run("GAME_PRODUCT_LINKS.fixture.html=badHtml");
    assert.equal(app.run("gameProductMarkup(game,codes)"), "");
  }
});

test("Moshimo and other providers are excluded from GAMEFINDER", () => {
  for (const provider of ["moshimo", "unknown"]) {
    const app = setup(); app.register(); app.context.provider = provider;
    app.run("GAME_PRODUCT_LINKS.fixture.provider=provider");
    assert.equal(app.run("gameProductMarkup(game,codes)"), "");
  }
});

test("checks every actual link destination instead of finding a Rakuten substring", () => {
  for (const href of [
    "https://example.invalid/?ref=https://hb.afl.rakuten.co.jp/",
    "https://hb.afl.rakuten.co.jp.example.invalid/",
    "https://hb.afl.rakuten.co.jp@example.invalid/",
    "http://hb.afl.rakuten.co.jp/hgc/test-only/",
    "//hb.afl.rakuten.co.jp/hgc/test-only/",
    "https://hb.afl.rakuten.co.jp\\@example.invalid/",
  ]) {
    const app = setup(); app.register();
    app.context.badHtml = html.replace("https://hb.afl.rakuten.co.jp/hgc/test-only/", href);
    app.run("GAME_PRODUCT_LINKS.fixture.html=badHtml");
    assert.equal(app.run("gameProductMarkup(game,codes)"), "", href);
  }
});

test("rejects mixed providers and external image sources even beside valid Rakuten HTML", () => {
  for (const extra of [
    '<a href="https://af.moshimo.com/af/c/click?test-only"><img src="https://thumbnail.image.rakuten.co.jp/test-only.jpg"></a>',
    '<img src="https://i.moshimo.com/af/i/impression?test-only">',
    '<img src="https://example.invalid/image.jpg">',
    '<img src="https://thumbnail.image.rakuten.co.jp.example.invalid/image.jpg">',
  ]) {
    const app = setup(); app.register(); app.context.badHtml = html + extra;
    app.run("GAME_PRODUCT_LINKS.fixture.html=badHtml");
    assert.equal(app.run("gameProductMarkup(game,codes)"), "");
  }
});

test("preserves static table markup, encoded query separators, and tracking images", () => {
  const app = setup(); app.register();
  const card = '<table border="0" cellpadding="0" cellspacing="0"><tbody><tr><td><a href="https://hbb.afl.rakuten.co.jp/hgc/test-only/?pc=test&amp;link_type=hybrid" target="_blank" rel="nofollow" style="word-wrap:break-word;"><img src="https://thumbnail.image.rakuten.co.jp/test-only.jpg" width="128" height="128" border="0" alt="test &amp; test" /></a><br /><span style="color:#333;">商品名</span></td></tr></tbody></table><img src="https://hbb.afl.rakuten.co.jp/b/test-only/" width="1" height="1" alt="">';
  app.context.card = card;
  app.run("GAME_PRODUCT_LINKS.fixture.html=card");
  const result = app.run("gameProductMarkup(game,codes)");
  assert.ok(result.includes(card));
  assert.ok(result.includes("楽天市場"));
});

test("rejects ambiguous attributes, active markup, and unsupported styles without modifying them", () => {
  for (const badHtml of [
    html.replace('<a href=', '<a onclick="alert(1)" href='),
    html.replace('<img src=', '<img srcset="https://example.invalid/a.jpg 2x" src='),
    html.replace('<a href=', '<a href="https://example.invalid/" href='),
    html + '<svg><a href="https://example.invalid/">test</a></svg>',
    html.replace('<img src=', '<img style="background:url(https://example.invalid/)" src='),
    html.replace('<img src=', '<img style="background:u&#114;l(https://example.invalid/)" src='),
    html + '</aside><p>outside card</p>',
  ]) {
    const app = setup(); app.register(); app.context.badHtml = badHtml;
    app.run("GAME_PRODUCT_LINKS.fixture.html=badHtml");
    assert.equal(app.run("gameProductMarkup(game,codes)"), "");
    assert.equal(app.run("GAME_PRODUCT_LINKS.fixture.html"), badHtml);
  }
});

test("an unlinked image or a link without an image is not an image purchase card", () => {
  const app = setup(); app.register();
  app.context.badHtml = '<img src="https://thumbnail.image.rakuten.co.jp/test-only.jpg"><a href="https://hb.afl.rakuten.co.jp/hgc/test-only/">商品名</a>';
  app.run("GAME_PRODUCT_LINKS.fixture.html=badHtml");
  assert.equal(app.run("gameProductMarkup(game,codes)"), "");
});

