const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1].split("?")[0]);

// Lightweight DOM for the shipped event callbacks. This does not check browser layout.
function createApp(search = "", navigator = {}) {
  const elements = new Map(), alerts = [], opened = [];
  class Element {
    constructor(tag = "div") {
      this.tagName = tag; this.children = []; this.dataset = {}; this.value = "";
      this.style = {}; this.className = ""; this.hidden = false; this.disabled = false;
      const has = name => this.className.split(/\s+/).includes(name);
      this.classList = {
        contains: has,
        add: name => { if (!has(name)) this.className += " " + name; },
        remove: name => { this.className = this.className.split(/\s+/).filter(x => x !== name).join(" "); },
        toggle: (name, force = !has(name)) => { force ? this.classList.add(name) : this.classList.remove(name); return force; },
      };
    }
    set innerHTML(value) {
      this.html = value; this.children = [];
      for (const match of value.matchAll(/<(\w+)\b([^>]*)>/g)) {
        const attrs = Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
        if (attrs.id) { const el = get("#" + attrs.id); el.className = attrs.class || ""; }
      }
    }
    get innerHTML() { return this.html || ""; }
    set textContent(value) { this.text = value; this.children = []; }
    get textContent() { return (this.text || "") + this.children.map(x => x.textContent).join(""); }
    appendChild(el) { this.children.push(el); return el; }
    focus() { this.focused = true; }
    select() { this.selected = true; }
    querySelector() { return this.heading ||= new Element("h2"); }
    querySelectorAll(selector) {
      if (selector !== ".reason") return [];
      return [...this.innerHTML.matchAll(/<button class="reason ([^"]*)" aria-pressed="([^"]*)" data-reason="([^"]*)">/g)].map(match => {
        const button = new Element("button");
        button.className = "reason " + match[1]; button.ariaPressed = match[2]; button.dataset.reason = match[3];
        this.children.push(button); return button;
      });
    }
  }
  function get(selector) {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  }
  const document = {
    querySelector: get,
    createElement: tag => new Element(tag),
    querySelectorAll: selector => selector === ".page" ? [1, 2, 3].map(n => get("#p" + n)) : [],
  };
  const initial = new Element(); initial.innerHTML = html;
  for (const n of [1, 2, 3]) get("#p" + n).id = "p" + n;
  const context = vm.createContext({
    document, navigator, URLSearchParams,
    location: { search, origin: "https://example.test", pathname: "/gamefinder/" },
    scrollTo() {}, alert: message => alerts.push(message),
    window: { open: (...args) => opened.push(args) },
  });
  for (const script of scripts) vm.runInContext(fs.readFileSync(path.join(root, script), "utf8"), context, { filename: script });
  const run = source => vm.runInContext(source, context);
  const data = source => JSON.parse(run("JSON.stringify(" + source + ")"));
  return { get, run, data, context, alerts, opened, result: () => get("#result").innerHTML };
}

test("shared diagnosis loads with Japanese titles on the first page load", () => {
  const params = new URLSearchParams({ bad: "122", good: "116", reason: "移動が多い" });
  const app = createApp("?" + params);
  assert.deepEqual(app.data("bad"), [122]);
  assert.deepEqual(app.data("good"), [116]);
  assert.deepEqual(app.data("reasons"), ["移動が多い"]);
  assert.equal(app.get("#home").classList.contains("hide"), true);
  assert.equal(app.get("#result").classList.contains("hide"), false);
  assert.equal(app.get("#stepLabel").textContent, "診断結果");
  assert.equal(app.get("#bar").style.width, "100%");
  assert.ok(app.result().includes("回答を変えて試す"));
  assert.ok(app.result().includes("理由との相性"));
});

test("changing one answer keeps the others and returns to the correct step", () => {
  const app = createApp("?bad=122&good=116&reason=" + encodeURIComponent("移動が多い"));
  app.get("#editReasons").onclick();
  assert.equal(app.get("#stepLabel").textContent, "STEP 2 / 3");
  assert.equal(app.get("#p2").classList.contains("hide"), false);
  assert.equal(app.get("#p1").classList.contains("hide"), true);
  assert.equal(app.get("#result").classList.contains("hide"), true);
  assert.equal(app.get("#result-after-ad").classList.contains("hide"), true);
  assert.equal(app.get("#gamefinder-ad").hidden, true);
  assert.deepEqual(app.data("({bad,good,reasons})"), { bad: [122], good: [116], reasons: ["移動が多い"] });
  app.get("#reasons").children.find(x => x.dataset.reason === "移動が多い").onclick();
  assert.equal(app.get("#reasonNext").textContent, "理由を選ばず次へ →");
  assert.deepEqual(app.data("reasons"), []);
  app.run("go(3); diagnose()");
  assert.equal(app.get("#stepLabel").textContent, "診断結果");
  assert.equal(app.get("#gamefinder-ad").hidden, false);
  assert.deepEqual(app.data("good"), [116]);
  assert.ok(!app.result().includes("理由との相性"));
});

test("Japanese selected pills can be removed and the first step is guarded", () => {
  const app = createApp();
  app.run("start()");
  assert.equal(app.get("#badNext").disabled, true);
  app.get("#badSearch").value = "すてらぶれいど";
  app.run("renderBad()");
  app.get("#bad").children.find(x => x.dataset.gameId === "137").onclick();
  assert.equal(app.get("#badNext").disabled, false);
  assert.ok(app.get("#badSel").textContent.includes("ステラブレイド"));
  app.get("#badSel").children[0].children[0].onclick();
  assert.deepEqual(app.data("bad"), []);
  assert.equal(app.get("#badNext").disabled, true);
  app.run("go(2)");
  assert.equal(app.get("#stepLabel").textContent, "STEP 1 / 3");
  assert.equal(app.alerts.length, 1);
});

test("no favourite game means no fictitious favourite score", () => {
  const app = createApp("?bad=122");
  assert.ok(!app.result().includes("好きとの近さ"));
  assert.ok(!app.result().includes("% MATCH"));
  assert.ok(app.result().includes("相性スコア"));
  assert.ok(!app.result().includes("理由との相性"));
});

test("explanations respond to a difficulty preference and flag conflicting candidates", () => {
  const app = createApp("?bad=122&reason=" + encodeURIComponent("難しすぎる"));
  assert.ok(app.run('explain(gameById(1))').includes("難易度が控えめ"));
  assert.ok(!app.run('explain(gameById(116))').includes("難易度が控えめ"));
  assert.deepEqual(app.data("resultWarnings(gameById(116))"), ["難易度は高め"]);
  assert.deepEqual(app.data("resultWarnings(gameById(1))"), []);
  app.run("reasons=['ストーリーが弱い']");
  assert.ok(app.run("explain(GAMES.find(g=>g.title==='Persona 5 Royal'))").includes("ストーリーの比重が高め"));
});

test("apostrophes and HTML characters do not break title rendering or X sharing", () => {
  const app = createApp("?bad=122");
  const title = "Assassin's Creed Mirage";
  app.run("showResult([{g:GAMES.find(g=>g.title===\"Assassin's Creed Mirage\"),score:.6,goodSim:.5,badAvoid:.6}])");
  assert.ok(app.result().includes("Assassin&#39;s Creed Mirage"));
  assert.ok(!app.result().includes("onclick="));
  app.get("#shareXButton").onclick();
  const opened = new URL(app.opened[0][0]);
  assert.ok(opened.searchParams.get("text").includes(title));
  assert.equal(opened.searchParams.get("url"), app.run("buildShareUrl()"));
  assert.equal(app.run("escapeHtml(" + JSON.stringify("A&B<test>\"'") + ")"), "A&amp;B&lt;test&gt;&quot;&#39;");
});

test("copy confirmation waits for the clipboard operation to succeed", async () => {
  let resolveCopy;
  const copied = [];
  const navigator = { clipboard: { writeText: text => { copied.push(text); return new Promise(resolve => resolveCopy = resolve); } } };
  const app = createApp("?bad=122", navigator);
  const operation = app.get("#shareResultButton").onclick();
  assert.equal(app.get("#shareStatus").textContent, "");
  assert.equal(copied.length, 1);
  resolveCopy();
  assert.equal(await operation, true);
  assert.ok(app.get("#shareStatus").textContent.includes("コピーしました"));
  assert.ok(copied[0].includes(app.run("buildShareUrl()")));
});

test("clipboard failure exposes a selectable URL instead of a false success", async () => {
  const app = createApp("?bad=122", { clipboard: { writeText: async () => { throw new Error("denied"); } } });
  assert.equal(await app.get("#shareResultButton").onclick(), false);
  assert.ok(!app.get("#shareStatus").textContent.includes("コピーしました"));
  assert.equal(app.get("#shareUrl").classList.contains("hide"), false);
  assert.equal(app.get("#shareUrl").value, app.run("buildShareUrl()"));
  assert.equal(app.get("#shareUrl").selected, true);
});

test("native share cancellation does not trigger a clipboard operation", async () => {
  let copies = 0;
  const app = createApp("?bad=122", {
    share: async () => { const error = new Error("cancelled"); error.name = "AbortError"; throw error; },
    clipboard: { writeText: async () => { copies++; } },
  });
  assert.equal(await app.get("#shareResultButton").onclick(), false);
  assert.equal(copies, 0);
  assert.equal(app.get("#shareStatus").textContent, "");
});

test("shared URL parsing ignores malformed reasons and preserves valid unique choices", () => {
  const params = new URLSearchParams({ bad: "122,122,NaN,999999,1,2,3,4,5", good: "122,116,116", reason: "%,constructor,__proto__,移動が多い,移動が多い" });
  const app = createApp("?" + params);
  assert.deepEqual(app.data("bad"), [122, 1, 2, 3, 4]);
  assert.deepEqual(app.data("good"), [116]);
  assert.deepEqual(app.data("reasons"), ["移動が多い"]);
  const legacy = new URL(app.run("buildShareUrl()"));
  const restored = createApp(legacy.search);
  assert.deepEqual(restored.data("({bad,good,reasons})"), app.data("({bad,good,reasons})"));
  assert.equal(restored.result(), app.result());
});
