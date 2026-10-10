const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1].split("?")[0]);

// DOM harness exercises the shipped render functions and button callbacks.
// Actual browser checks are recorded in docs/search-audit.md.
class Element {
  constructor(tag = "div") {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.value = "";
    this.className = "";
    this.disabled = false;
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  set innerHTML(value) { this.html = value; this.children = []; }
  get innerHTML() { return this.html || ""; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return (this.text || "") + this.children.map(x => x.textContent).join(""); }
  appendChild(child) { this.children.push(child); return child; }
}

function createApp() {
  const elements = new Map();
  const get = selector => {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  };
  const alerts = [];
  const context = vm.createContext({
    document: { querySelector: get, createElement: tag => new Element(tag), querySelectorAll: () => [] },
    location: { search: "", origin: "https://example.test", pathname: "/" },
    URLSearchParams,
    alert: message => alerts.push(message),
  });
  for (const script of scripts) {
    vm.runInContext(fs.readFileSync(path.join(root, script), "utf8"), context, { filename: script });
  }
  const run = expression => vm.runInContext(expression, context);
  const data = expression => JSON.parse(run("JSON.stringify(" + expression + ")"));
  const results = query => {
    context.query = query;
    return data("searchGames(query, realGames()).map(g => g.title)");
  };
  const buttons = selector => get(selector).children.filter(b => b.className.split(" ").includes("game"));
  const rendered = query => {
    get("#badSearch").value = query;
    get("#goodSearch").value = query;
    run("renderBad(); renderGood()");
    return ["#bad", "#good"].map(selector => buttons(selector).map(b => Number(b.dataset.gameId)));
  };
  return { context, get, run, data, results, buttons, rendered, alerts };
}

test("index loads data and shared search before app; list has one implementation", () => {
  assert.deepEqual(scripts, ["games800.js", "jp-search.js", "app.js"]);
  const code = scripts.map(script => fs.readFileSync(path.join(root, script), "utf8")).join("\n");
  assert.equal([...code.matchAll(/function list\s*\(/g)].length, 1);
});

test("catalog IDs, real games, and alias keys are consistent", () => {
  const app = createApp();
  const games = app.data("GAMES");
  assert.equal(games.length, 1000);
  assert.equal(new Set(games.map(g => g.id)).size, 1000);
  assert.equal(new Set(games.map(g => g.title)).size, 1000);
  assert.equal(app.run("realGames().length"), 1000);
  for (const [id, title] of [[137, "Stellar Blade"], [642, "Hades"], [643, "Hades II"], [999, "Final Fantasy VII"]]) {
    assert.equal(games.find(g => g.id === id).title, title);
  }
  const titleSet = new Set(games.map(g => g.title));
  for (const [title, aliases] of Object.entries(app.data("JP_ALIASES"))) {
    assert.ok(titleSet.has(title), "Missing alias key: " + title);
    app.context.aliasValues = aliases;
    const normalized = app.data("aliasValues.map(normJP)");
    assert.equal(new Set(normalized).size, aliases.length, "Repeated alias: " + title);
  }
  assert.ok(app.run("JP_SERIES_ALIASES.every(rule => GAMES.some(g => rule.pattern.test(g.title)))"));
});

test("every canonical title and every registered alias finds its intended game", () => {
  const app = createApp();
  const cases = app.data("GAMES.flatMap(g => [g.title, ...(JP_ALIASES[g.title] || [])].map(query => ({ query, title: g.title })))");
  for (const { query, title } of cases) {
    assert.ok(app.results(query).includes(title), query + " must find " + title);
  }
});

test("series names find every catalog member, including entries without a title alias", () => {
  const app = createApp();
  const series = app.data("JP_SERIES_ALIASES.map(rule => ({ queries: rule.aliases, titles: GAMES.filter(g => rule.pattern.test(g.title)).map(g => g.title) }))");
  for (const { queries, titles } of series) {
    for (const query of queries) {
      const resultSet = new Set(app.results(query));
      for (const title of titles) assert.ok(resultSet.has(title), query + " must include " + title);
    }
  }
  assert.equal(app.results("モンハン").length, 17);
  assert.equal(app.results("ゼルダ").length, 16);
  assert.equal(app.results("ダクソ").length, 3);
});

test("Hades spelling, width, punctuation and kana variants resolve correctly", () => {
  const app = createApp();
  for (const query of ["ハデス2", "ハデスⅡ", "Hades 2", "Hades II", "ＨＡＤＥＳ　２", "はです２", "ﾊﾃﾞｽ2"]) {
    assert.deepEqual(app.results(query), ["Hades II"]);
  }
  for (const query of ["ステラブレイド", "ステラ", "すてらぶれいど", "ｽﾃﾗﾌﾞﾚｲﾄﾞ", "Stellar Blade"]) {
    assert.deepEqual(app.results(query), ["Stellar Blade"]);
  }
  assert.deepEqual(app.results("黒神話：悟空"), ["Black Myth: Wukong"]);
  assert.deepEqual(app.results("ＦＦ１６"), ["Final Fantasy XVI"]);
  assert.deepEqual(app.results("だくそ３"), ["Dark Souls III"]);
});

test("shared abbreviations return distinct games without repeated candidates", () => {
  const app = createApp();
  assert.deepEqual(app.results("FF7R"), [
    "Final Fantasy VII Rebirth", "Final Fantasy VII Remake", "Final Fantasy VII Remake Intergrade",
  ]);
  assert.equal(app.results("鬼武者").length, 5);
  assert.equal(app.results("妖怪ウォッチ").length, 4);
  for (const query of ["FF7R", "鬼武者", "妖怪ウォッチ", "ハデス"]) {
    const results = app.results(query);
    assert.equal(results.length, new Set(results).size);
  }
});

test("numbered abbreviations do not match a longer number; exact matches come first", () => {
  const app = createApp();
  assert.deepEqual(app.results("FF1"), ["Final Fantasy"]);
  assert.deepEqual(app.results("FF16"), ["Final Fantasy XVI"]);
  assert.deepEqual(app.results("ダクソ2"), ["Dark Souls II: Scholar of the First Sin"]);
  assert.equal(app.results("Final Fantasy VII")[0], "Final Fantasy VII");
  assert.equal(app.results("Elden Ring")[0], "Elden Ring");
});

test("empty and unmatched searches return no games; placeholder exclusion remains", () => {
  const app = createApp();
  for (const query of ["", " 　", "： ・", "存在しないタイトルxyz987654"]) assert.deepEqual(app.results(query), []);
  app.run('GAMES.push({ id: 1001, title: "ゲーム候補 1001" })');
  assert.equal(app.run("realGames().length"), 1000);
  assert.deepEqual(app.results("ゲーム候補"), []);
  app.rendered("");
  assert.ok(app.get("#bad").innerHTML.includes("ゲーム名を入力"));
  app.rendered("存在しないタイトルxyz987654");
  assert.ok(app.get("#good").innerHTML.includes("見つかりませんでした"));
});

test("renderBad and renderGood show identical IDs and order for every indexed search term", () => {
  const app = createApp();
  const terms = app.data("[...new Set(GAMES.flatMap(g => gameSearchTerms(g.title)))]");
  for (const query of terms) {
    const [badIds, goodIds] = app.rendered(query);
    assert.deepEqual(badIds, goodIds, query);
    assert.ok(badIds.length > 0, query + " must render a candidate");
    app.context.query = query;
    assert.deepEqual(badIds, app.data("searchGames(query, realGames()).slice(0, 40).map(g => g.id)"), query);
  }
});

test("more results makes every match accessible in both inputs", () => {
  const app = createApp();
  app.rendered("a");
  const count = app.results("a").length;
  assert.ok(count > 40);
  for (const selector of ["#bad", "#good"]) {
    while (app.get(selector).children.some(b => b.className === "secondary search-more")) {
      app.get(selector).children.find(b => b.className === "secondary search-more").onclick();
    }
    assert.equal(app.buttons(selector).length, count);
  }
  assert.deepEqual(app.buttons("#bad").map(b => b.dataset.gameId), app.buttons("#good").map(b => b.dataset.gameId));
});

test("selection disables only the opposite input and removal updates both inputs", () => {
  const app = createApp();
  app.rendered("ステラブレイド");
  app.buttons("#bad")[0].onclick();
  assert.deepEqual(app.data("bad"), [137]);
  assert.equal(app.buttons("#good")[0].disabled, true);
  assert.equal(app.buttons("#bad")[0].disabled, false);
  assert.deepEqual(app.buttons("#bad").map(b => b.dataset.gameId), app.buttons("#good").map(b => b.dataset.gameId));
  app.run("removeBad(137)");
  assert.equal(app.buttons("#good")[0].disabled, false);
  app.buttons("#good")[0].onclick();
  assert.equal(app.buttons("#bad")[0].disabled, true);
  app.run("removeGood(137)");
  assert.equal(app.buttons("#bad")[0].disabled, false);
});

test("selection retains the five-game limit and allows deselection", () => {
  const app = createApp();
  app.rendered("モンハン");
  const ids = app.buttons("#bad").slice(0, 6).map(b => b.dataset.gameId);
  for (const id of ids) app.buttons("#bad").find(b => b.dataset.gameId === id).onclick();
  assert.equal(app.run("bad.length"), 5);
  assert.equal(app.alerts.length, 1);
  app.buttons("#bad").find(b => b.dataset.gameId === ids[0]).onclick();
  assert.equal(app.run("bad.length"), 4);
});

test("diagnosis sees Stellar Blade and excludes selected games without altering scoring", () => {
  const app = createApp();
  app.run("const originalDiversify=diversify; diversify=items=>{ globalThis.candidates=items; return originalDiversify(items) }; bad=[122]; good=[]; reasons=[]; showResult=ranked=>{ globalThis.ranked=ranked }; diagnose()");
  assert.equal(app.run("ranked.length"), 5);
  assert.ok(app.data("candidates.map(x=>x.g.id)").includes(137));
  assert.ok(!app.data("candidates.map(x=>x.g.id)").includes(122));
  assert.equal(app.run("candidates.find(x=>x.g.id===137).score"), 0);
  app.run("bad=[137]; diagnose()");
  assert.ok(!app.data("candidates.map(x=>x.g.id)").includes(137));
});

