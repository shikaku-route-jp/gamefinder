let bad=[],good=[],reasons=[];
const $=s=>document.querySelector(s);
const REASONS={"装備集め・ハクスラ":{loot:-1,build:-.8},"移動が多い":{travel_burden:-1,open_world:-.25},"戦闘が単調":{combat:.25,reaction:1,speed:1},"難しすぎる":{difficulty:-1},"ストーリーが弱い":{story:1},"キャラにハマれない":{characters:1},"探索が面倒":{exploration:-.8,travel_burden:-1},"育成・ビルドが合わない":{build:-1,rpg:-.7},"操作感・テンポが合わない":{speed:1,reaction:1},"自由度が低い":{linear:-1,open_world:1}};
const AXIS_WEIGHTS={combat:1.3,parry:1.35,reaction:1.35,story:1.1,characters:1,exploration:.9,open_world:.8,rpg:.7,build:.8,loot:.7,roguelike:.8,speed:1.15,spectacle:.9,linear:.7,travel_burden:1,difficulty:.85};
const realGames=()=>GAMES.filter(g=>!/^ゲーム候補\s*\d+$/.test(g.title));
const gameById=id=>GAMES.find(g=>g.id===id);
function setAdVisible(visible) {
  const box = $("#gamefinder-ad");
  if (!box) return;
  box.classList.toggle("hide", !visible);
  box.hidden = !visible;
}
function start() {
  setAdVisible(false);
  $("#home").classList.add("hide");
  $("#quiz").classList.remove("hide");
  $("#result").classList.add("hide");
  $("#result-after-ad").classList.add("hide");
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("hide", page.id !== "p1");
  });
  $("#bar").style.width = "33%";
  $("#stepLabel").textContent = "STEP 1 / 3";
  renderBad();
  renderWhy();
  renderGood();
  updateCounts();
  scrollTo({top:0,behavior:"smooth"});
}
function go(n) {
  if (![1, 2, 3].includes(n)) return;
  if (n === 2 && !bad.length) {
    alert("まず「つまらなかったゲーム」を1本以上選んでください。");
    return;
  }
  $("#home").classList.add("hide");
  $("#quiz").classList.remove("hide");
  $("#result").classList.add("hide");
  $("#result-after-ad").classList.add("hide");
  setAdVisible(false);
  document.querySelectorAll(".page").forEach(x => x.classList.toggle("hide", x.id !== "p" + n));
  $("#bar").style.width = n / 3 * 100 + "%";
  $("#stepLabel").textContent = "STEP " + n + " / 3";
  scrollTo({ top: 0, behavior: "smooth" });
  $("#p" + n).querySelector("h2")?.focus({ preventScroll: true });
}

function editAnswers(n) {
  renderBad();
  renderWhy();
  renderGood();
  updateCounts();
  go(n);
}
/* 描画はここだけで行い、検索結果は searchGames() に統一する。 */
function list(q, sel, setter, id, type, limit = 40) {
  const box = $(id);
  box.innerHTML = "";
  if (!normJP(q)) {
    box.innerHTML = '<div class="hint">ゲーム名を入力して検索してください（日本語・英語・略称OK）</div>';
    return;
  }
  const source = searchGames(q, realGames());
  source.slice(0, limit).forEach(g => {
    const b = document.createElement("button");
    const other = type === "bad" && good.includes(g.id) || type === "good" && bad.includes(g.id);
    b.className = "game" + (sel.includes(g.id) ? " on" : "") + (other ? " disabled" : "");
    b.dataset.gameId = String(g.id);
    const label = document.createElement("span");
    const displayName = jpDisplayName(g);
    label.textContent = displayName;
    if (displayName !== g.title) {
      const english = document.createElement("small");
      english.className = "alias-en";
      english.textContent = g.title;
      label.appendChild(english);
    }
    b.appendChild(label);
    if (sel.includes(g.id)) {
      const check = document.createElement("b");
      check.textContent = "✓";
      b.appendChild(check);
    }
    b.disabled = other;
    b.ariaPressed = String(sel.includes(g.id));
    b.onclick = () => {
      if (sel.includes(g.id)) setter(sel.filter(x => x !== g.id));
      else if (sel.length < 5) setter([...sel, g.id]);
      else alert("最大5本まで選べます。");
      renderBad();
      renderGood();
      updateCounts();
    };
    box.appendChild(b);
  });
  if (!source.length) {
    box.innerHTML = '<div class="hint">見つかりませんでした。日本語名・英語名・略称を変えて試してください。</div>';
  } else if (source.length > limit) {
    const more = document.createElement("button");
    more.className = "secondary search-more";
    more.textContent = "ほか " + (source.length - limit) + " 件を表示";
    more.onclick = () => list(q, sel, setter, id, type, limit + 40);
    box.appendChild(more);
  }
}
function renderSelected(ids, selector, remove) {
  const box = $(selector);
  box.innerHTML = "";
  ids.forEach(id => {
    const name = jpDisplayName(gameById(id));
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = name;
    const button = document.createElement("button");
    button.textContent = "×";
    button.ariaLabel = name + "の選択を解除";
    button.onclick = () => remove(id);
    pill.appendChild(button);
    box.appendChild(pill);
  });
}
function renderBad() {
  list($("#badSearch").value, bad, x => bad = x, "#bad", "bad");
  renderSelected(bad, "#badSel", removeBad);
}
function renderGood() {
  list($("#goodSearch").value, good, x => good = x, "#good", "good");
  renderSelected(good, "#goodSel", removeGood);
}
function removeBad(id){bad=bad.filter(x=>x!==id);renderBad();renderGood();updateCounts()}
function removeGood(id){good=good.filter(x=>x!==id);renderBad();renderGood();updateCounts()}
function renderWhy(){const box=$("#reasons");box.innerHTML=Object.keys(REASONS).map(r=>`<button class="reason ${reasons.includes(r)?"on":""}" aria-pressed="${reasons.includes(r)}" data-reason="${r}">${r}</button>`).join("");box.querySelectorAll(".reason").forEach(b=>b.onclick=()=>{const r=b.dataset.reason;reasons=reasons.includes(r)?reasons.filter(x=>x!==r):[...reasons,r];b.classList.toggle("on",reasons.includes(r));b.ariaPressed=String(reasons.includes(r));updateCounts()})}
function updateCounts() {
  ["bad", "good"].forEach(t => $("#" + t + "Count").textContent = `${t === "bad" ? bad.length : good.length}/5`);
  $("#reasonCount").textContent = `${reasons.length}個`;
  $("#badNext").disabled = !bad.length;
  $("#reasonNext").textContent = reasons.length ? "次へ →" : "理由を選ばず次へ →";
  $("#goodDiagnose").textContent = good.length ? "この条件で診断する →" : "好きなゲームを入れず診断する →";
}
function distance(a,b){let s=0,w=0;for(const k of AXES){const z=AXIS_WEIGHTS[k]||1;s+=z*Math.abs((a[k]??.5)-(b[k]??.5));w+=z}return s/w}
function reasonFit(p){if(!reasons.length)return .5;let total=0,w=0;for(const r of reasons)for(const[k,d]of Object.entries(REASONS[r])){const v=p[k]??.5;total+=d>0?v*Math.abs(d):(1-v)*Math.abs(d);w+=Math.abs(d)}return total/w}
const REASON_COPY = {
  "装備集め・ハクスラ": ["装備集めやビルドの比重が低め", "装備集めやビルドの比重は高め"],
  "移動が多い": ["移動の負担が少なめ", "移動が負担になる可能性あり"],
  "戦闘が単調": ["反応やテンポを重視した戦闘", "戦闘のテンポは控えめ"],
  "難しすぎる": ["難易度が控えめ", "難易度は高め"],
  "ストーリーが弱い": ["ストーリーの比重が高め", "ストーリーの比重は低め"],
  "キャラにハマれない": ["キャラクターの比重が高め", "キャラクターの比重は低め"],
  "探索が面倒": ["探索や移動の負担が少なめ", "探索や移動の比重は高め"],
  "育成・ビルドが合わない": ["育成やビルドの比重が低め", "育成やビルドの比重は高め"],
  "操作感・テンポが合わない": ["反応やテンポを重視した操作", "操作のテンポは控えめ"],
  "自由度が低い": ["自由な探索を重視した特徴", "進め方の自由度は控えめ"],
};

function singleReasonFit(profile, reason) {
  let sum = 0, weight = 0;
  for (const [axis, direction] of Object.entries(REASONS[reason])) {
    const value = profile[axis] ?? .5;
    sum += (direction > 0 ? value : 1 - value) * Math.abs(direction);
    weight += Math.abs(direction);
  }
  return sum / weight;
}

function explain(g) {
  const matches = reasons.filter(r => singleReasonFit(g.profile, r) >= .65)
    .map(r => REASON_COPY[r][0]);
  if (good.length) {
    const closest = good.map(gameById).map(game => ({ game, similarity: 1 - distance(game.profile, g.profile) }))
      .sort((a, b) => b.similarity - a.similarity)[0];
    if (closest.similarity >= .65) matches.push(`「${jpDisplayName(closest.game)}」と特徴が近い`);
  }
  if (!matches.length) {
    const axes = {
      difficulty: ["難易度が低め", "難易度が高め"],
      story: ["ストーリーの比重が低め", "ストーリーの比重が高め"],
      travel_burden: ["移動の負担が少なめ", "移動の負担が多め"],
      build: ["ビルドの比重が低め", "ビルドの比重が高め"],
      exploration: ["探索の比重が低め", "探索の比重が高め"],
    };
    const differences = Object.keys(axes).map(axis => {
      const average = bad.map(gameById).reduce((s, game) => s + (game.profile[axis] ?? .5), 0) / bad.length;
      return { axis, difference: (g.profile[axis] ?? .5) - average };
    }).filter(x => Math.abs(x.difference) >= .2).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
    for (const x of differences.slice(0, 2)) matches.push("苦手な作品より" + axes[x.axis][x.difference > 0 ? 1 : 0]);
  }
  return [...new Set(matches)].slice(0, 3).join("・") || "入力した作品と特徴全体を比較して選びました";
}

function resultWarnings(g) {
  return reasons.filter(r => singleReasonFit(g.profile, r) <= .4).map(r => REASON_COPY[r][1]);
}
function shareData(){return{bad:[...bad],good:[...good],reasons:[...reasons]}}
function buildShareUrl(){const s=shareData(),p=new URLSearchParams();if(s.bad.length)p.set("bad",s.bad.join(","));if(s.good.length)p.set("good",s.good.join(","));if(s.reasons.length)p.set("reason",s.reasons.map(encodeURIComponent).join(","));return location.origin+location.pathname+"?"+p.toString()}
function showShareStatus(message, url = "") {
  $("#shareStatus").textContent = message;
  const input = $("#shareUrl");
  input.classList.toggle("hide", !url);
  input.value = url;
  if (url) { input.focus(); input.select(); }
}
async function shareResult(title) {
  const text = `${title}が次にハマるかも？ GAMEFINDERで「つまらなかったゲーム」から診断してみた。`;
  const url = buildShareUrl();
  if (navigator.share) {
    try {
      await navigator.share({ title: "GAMEFINDER 診断結果", text, url });
      return true;
    } catch (error) {
      if (error.name === "AbortError") return false;
    }
  }
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(`${text}\n${url}`);
    showShareStatus("診断結果の共有用URLをコピーしました。");
    return true;
  } catch {
    showShareStatus("共有用URLを長押ししてコピーできます。", url);
    return false;
  }
}
function shareX(title){const text=`${title}が次にハマるかも？\nGAMEFINDERで「つまらなかったゲーム」から診断してみた。\n#GAMEFINDER`;const url=buildShareUrl();window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text)+"&url="+encodeURIComponent(url),"_blank","noopener,noreferrer")}
function seriesKey(title){let t=title.toLowerCase().replace(/[：:！!？?・'’“”"()（）\[\]【】]/g,"").replace(/\s+/g," ").trim();t=t.replace(/\b(remastered|remake|definitive edition|directors cut|director's cut|complete edition|gold edition|goty edition|game of the year edition)\b/g,"");const m=t.match(/^(.+?)(?:\s+(?:ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16))?(?:\s*[-–—]\s*.+)?$/);return(m?.[1]||t).trim()}
function diversify(ranked){const out=[],used=new Set();for(const x of ranked){const key=seriesKey(x.g.title);if(used.has(key))continue;out.push(x);used.add(key);if(out.length>=5)break}if(out.length<5){for(const x of ranked){if(out.some(y=>y.g.id===x.g.id))continue;out.push(x);if(out.length>=5)break}}return out}
function loadSharedDiagnosis() {
  const p = new URLSearchParams(location.search);
  const parseIds = key => [...new Set((p.get(key) || "").split(",").map(Number)
    .filter(id => Number.isInteger(id) && gameById(id) && !/^ゲーム候補\s*\d+$/.test(gameById(id).title)))];
  const sharedBad = parseIds("bad").slice(0, 5);
  const sharedGood = parseIds("good").filter(id => !sharedBad.includes(id)).slice(0, 5);
  const sharedReasons = (p.get("reason") || "").split(",").map(reason => {
    // 初期版の二重エンコードURLと、通常のURLSearchParams形式の両方を読む。
    if (Object.hasOwn(REASONS, reason)) return reason;
    try { return decodeURIComponent(reason); } catch { return ""; }
  }).filter(reason => Object.hasOwn(REASONS, reason));
  if (!sharedBad.length) return false;
  bad = sharedBad;
  good = sharedGood;
  reasons = [...new Set(sharedReasons)];
  updateCounts();
  diagnose();
  return true;
}
function diagnose(){if(!bad.length){alert("つまらなかったゲームを1本以上選んでください。");go(1);return}const candidates=realGames().filter(g=>!bad.includes(g.id)&&!good.includes(g.id)),bp=bad.map(i=>gameById(i).profile),gp=good.map(i=>gameById(i).profile);const ranked=candidates.map(g=>{const goodSim=gp.length?1-gp.reduce((s,p)=>s+distance(p,g.profile),0)/gp.length:.5;const badAvoid=bp.length?bp.reduce((s,p)=>s+distance(p,g.profile),0)/bp.length:.5;const fit=reasonFit(g.profile);const score=gp.length&&reasons.length?goodSim*.45+badAvoid*.35+fit*.2:gp.length?goodSim*.62+badAvoid*.38:reasons.length?badAvoid*.7+fit*.3:badAvoid;return{g,score,goodSim,badAvoid}}).sort((a,b)=>b.score-a.score);showResult(diversify(ranked))}
function injectAd() {
  // 既存の1枠を再表示する。タグやiframeを作り直さない。
  setAdVisible(true);
  $("#result-after-ad").classList.remove("hide");
}
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

function resultTags(item) {
  const tags = [];
  if (good.length) tags.push("好きとの近さ " + Math.round(item.goodSim * 100) + "点");
  tags.push("苦手との違い " + Math.round(item.badAvoid * 100) + "点");
  if (reasons.length) tags.push("理由との相性 " + Math.round(reasonFit(item.g.profile) * 100) + "点");
  return tags.map(tag => `<span>${tag}</span>`).join("");
}

function resultName(game, tag) {
  const name = jpDisplayName(game);
  return `<${tag}>${escapeHtml(name)}</${tag}>` + (name !== game.title ? `<p class="title-en">${escapeHtml(game.title)}</p>` : "");
}

function showResult(ranked) {
  const top = ranked[0];
  if (!top) return;
  $("#home").classList.add("hide");
  $("#quiz").classList.remove("hide");
  document.querySelectorAll(".page").forEach(x => x.classList.add("hide"));
  $("#result").classList.remove("hide");
  $("#bar").style.width = "100%";
  $("#stepLabel").textContent = "診断結果";
  const infoLevel = bad.length + good.length + reasons.length >= 7 ? "充実" : bad.length + good.length + reasons.length >= 4 ? "標準" : "少なめ";
  const names = ids => ids.map(id => jpDisplayName(gameById(id))).join("、") || "入力なし";
  $("#result").innerHTML = `
    <div class="result-head"><small>YOUR RESULT</small><h2 tabindex="-1">次に試してみたいゲーム</h2>
      <p class="confidence">入力情報の充実度 <b>${infoLevel}</b>　苦手 ${bad.length}本・好き ${good.length}本・理由 ${reasons.length}個</p>
    </div>
    <div class="hero-result">
      <div class="rank">#1</div><div class="score">${Math.round(top.score * 100)}<small>/ 100　相性スコア</small></div>
      ${resultName(top.g, "h2")}<p>${escapeHtml(explain(top.g))}</p>
      ${resultWarnings(top.g).length ? `<p class="result-caution">気になる点：${escapeHtml(resultWarnings(top.g).join("・"))}</p>` : ""}
      <div class="match-tags">${resultTags(top)}</div>
      <button class="share-btn" id="shareResultButton">結果をシェアする ↗</button><button class="share-x" id="shareXButton">Xでシェア ↗</button>
      <p id="shareStatus" class="share-status" role="status"></p>
      <input id="shareUrl" class="hide" aria-label="診断結果の共有用URL" readonly>
    </div>
    <h2 class="section-title">おすすめTOP${ranked.length}</h2>
    ${ranked.map((x, i) => `<article class="card result-card"><div class="rank-mini">0${i + 1}</div><div>
      ${resultName(x.g, "h3")}<p>あなたに合いそうな理由：<b>${escapeHtml(explain(x.g))}</b></p>
      ${resultWarnings(x.g).length ? `<p class="result-caution">気になる点：${escapeHtml(resultWarnings(x.g).join("・"))}</p>` : ""}
      <div class="bars">${resultTags(x)}</div>
    </div></article>`).join("")}
    <section class="answer-summary" aria-label="診断に使った回答"><h2 class="section-title">回答を変えて試す</h2>
      <div class="answer-row"><div><b>苦手だったゲーム</b><p>${escapeHtml(names(bad))}</p></div><button class="secondary" id="editBad">変更</button></div>
      <div class="answer-row"><div><b>合わなかった理由</b><p>${escapeHtml(reasons.join("、") || "選択なし")}</p></div><button class="secondary" id="editReasons">変更</button></div>
      <div class="answer-row"><div><b>好きだったゲーム</b><p>${escapeHtml(names(good))}</p></div><button class="secondary" id="editGood">変更</button></div>
    </section>`;
  $("#shareResultButton").onclick = () => shareResult(jpDisplayName(top.g));
  $("#shareXButton").onclick = () => shareX(jpDisplayName(top.g));
  $("#editBad").onclick = () => editAnswers(1);
  $("#editReasons").onclick = () => editAnswers(2);
  $("#editGood").onclick = () => editAnswers(3);
  injectAd();
  scrollTo({ top: 0, behavior: "smooth" });
  $("#result h2").focus({ preventScroll: true });
}
loadSharedDiagnosis();
