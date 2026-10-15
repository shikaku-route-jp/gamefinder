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
