/* GAMEFINDER 日本語検索。キーは games800.js の title と完全一致させる。 */
const JP_ALIASES = {
  "Elden Ring": ["エルデンリング","エルデン","elden"],
  "Elden Ring Nightreign": ["エルデンリング ナイトレイン","ナイトレイン","nightreign"],
  "Elden Ring Tarnished Edition": ["エルデンリング ターニッシュド エディション"],
  "Sekiro: Shadows Die Twice": ["隻狼","せきろう","セキロ","sekiro"],
  "Dark Souls Remastered": ["ダークソウル","ダクソ","ダクソ1"],
  "Dark Souls II: Scholar of the First Sin": ["ダークソウル2","ダクソ2"],
  "Dark Souls III": ["ダークソウル3","ダクソ3"],
  "Demon's Souls": ["デモンズソウル","デモンズ"],
  "Bloodborne": ["ブラッドボーン","ブラボ"],
  "Armored Core VI: Fires of Rubicon": ["アーマードコア6","アーマードコアVI","AC6","アーマードコア"],
  "Lies of P": ["ライズオブP","ライスオブP","嘘のP"],
  "Nioh": ["仁王","仁王1"],
  "Nioh 2": ["仁王2"],
  "Nioh 3": ["仁王3"],
  "Rise of the Ronin": ["ライズオブザローニン","ローニン"],
  "Wo Long: Fallen Dynasty": ["ウォーロン","Wo Long"],
  "Mortal Shell": ["モータルシェル"],
  "Thymesia": ["タイメシア"],
  "Stellar Blade": ["ステラブレイド","ステラ"],
  "Black Myth: Wukong": ["黒神話 悟空","悟空"],
  "The Legend of Zelda: Tears of the Kingdom": ["ゼルダの伝説 ティアーズ オブ ザ キングダム","ティアキン"],
  "The Legend of Zelda: Breath of the Wild": ["ゼルダの伝説 ブレス オブ ザ ワイルド","ブレワイ"],
  "Super Mario Odyssey": ["スーパーマリオ オデッセイ","マリオオデッセイ"],
  "Super Mario Bros. Wonder": ["スーパーマリオブラザーズ ワンダー","マリオワンダー"],
  "Mario Kart World": ["マリオカート ワールド","マリカワールド"],
  "Mario Kart 8 Deluxe": ["マリオカート8 デラックス","マリカ8"],
  "Animal Crossing: New Horizons": ["あつまれ どうぶつの森","あつ森"],
  "Super Smash Bros. Ultimate": ["大乱闘スマッシュブラザーズ SPECIAL","スマブラSP","スマブラ"],
  "Pokemon Scarlet": ["ポケットモンスター スカーレット","ポケモン スカーレット"],
  "Pokemon Violet": ["ポケットモンスター バイオレット","ポケモン バイオレット"],
  "Pokemon Legends: Arceus": ["Pokémon LEGENDS アルセウス","ポケモン アルセウス","アルセウス"],
  "Splatoon 3": ["スプラトゥーン3","スプラ3"],
  "Splatoon 2": ["スプラトゥーン2","スプラ2"],
  "Splatoon": ["スプラトゥーン","スプラ"],
  "Metroid Dread": ["メトロイド ドレッド","メトロイド"],
  "Metroid Prime Remastered": ["メトロイドプライム リマスタード"],
  "Kirby and the Forgotten Land": ["星のカービィ ディスカバリー","カービィ ディスカバリー"],
  "Pikmin 4": ["ピクミン4","ピクミン"],
  "Final Fantasy VII Rebirth": ["ファイナルファンタジーVII リバース","FF7リバース","FF7R"],
  "Final Fantasy VII Remake": ["ファイナルファンタジーVII リメイク","FF7リメイク","FF7R"],
  "Final Fantasy XVI": ["ファイナルファンタジーXVI","FF16"],
  "Final Fantasy XV": ["ファイナルファンタジーXV","FF15"],
  "Final Fantasy XIV Online": ["ファイナルファンタジーXIV","FF14"],
  "Dragon Quest XI S": ["ドラゴンクエストXI","ドラクエ11","DQ11"],
  "Dragon Quest III HD-2D Remake": ["ドラゴンクエストIII HD-2D版","ドラクエ3","DQ3"],
  "Kingdom Hearts III": ["キングダムハーツ3","KH3"],
  "NieR: Automata": ["ニーア オートマタ","ニーア"],
  "Persona 5 Royal": ["ペルソナ5 ザ・ロイヤル","P5R","ペルソナ5"],
  "Persona 4 Golden": ["ペルソナ4 ザ・ゴールデン","P4G","ペルソナ4"],
  "Persona 3 Reload": ["ペルソナ3 リロード","P3R","ペルソナ3"],
  "Metaphor: ReFantazio": ["メタファー リファンタジオ","メタファー"],
  "Like a Dragon: Infinite Wealth": ["龍が如く8","如く8"],
  "Yakuza 0": ["龍が如く0","龍が如く0 誓いの場所"],
  "Monster Hunter Wilds": ["モンスターハンターワイルズ","モンハンワイルズ","ワイルズ","MHWilds"],
  "Monster Hunter World": ["モンスターハンター ワールド","モンハンワールド","MHW"],
  "Monster Hunter World: Iceborne": ["モンスターハンターワールド アイスボーン","アイスボーン","MHW:I"],
  "Monster Hunter Rise": ["モンスターハンターライズ","モンハンライズ","ライズ"],
  "Monster Hunter Rise: Sunbreak": ["モンスターハンターライズ サンブレイク","サンブレイク"],
  "Devil May Cry 5": ["デビル メイ クライ5","DMC5"],
  "Resident Evil 4 Remake": ["バイオハザード RE:4","バイオ4リメイク","RE4"],
  "Resident Evil 7": ["バイオハザード7","バイオ7"],
  "Resident Evil Village": ["バイオハザード ヴィレッジ","バイオ8","RE8"],
  "Dragon's Dogma 2": ["ドラゴンズドグマ2","ドグマ2","DD2"],
  "Onimusha: Way of the Sword": ["鬼武者 Way of the Sword","鬼武者 ウェイ オブ ザ ソード","鬼武者 新作","鬼武者"],
  "Onimusha: Warlords": ["鬼武者","鬼武者1"],
  "Kunitsu-Gami: Path of the Goddess": ["祇","祇：Path of the Goddess","くにつがみ"],
  "Returnal": ["リターナル"],
  "Hollow Knight": ["ホロウナイト"],
  "Ghostrunner": ["ゴーストランナー"],
  "Ghostrunner 2": ["ゴーストランナー2"],
  "Sifu": ["師父","シフ"],
  "God of War Ragnarök": ["ゴッド・オブ・ウォー ラグナロク","GOWラグナロク"],
  "God of War 2018": ["ゴッド・オブ・ウォー","GOW"],
  "Ghost of Tsushima Director's Cut": ["ゴースト・オブ・ツシマ","ツシマ"],
  "Marvel's Spider-Man 2": ["スパイダーマン2"],
  "Astro Bot": ["アストロボット"],
  "The Witcher 3: Wild Hunt": ["ウィッチャー3"],
  "Cyberpunk 2077": ["サイバーパンク2077","サイパン"],
  "Baldur's Gate 3": ["バルダーズ・ゲート3","BG3"],
  "Starfield": ["スターフィールド"],
  "Hogwarts Legacy": ["ホグワーツ レガシー","ホグワーツ"],
  "Grand Theft Auto V": ["グランド・セフト・オートV","GTA5","GTA V"],
  "Red Dead Redemption 2": ["レッド・デッド・リデンプション2","RDR2"],
  "Assassin's Creed Shadows": ["アサシン クリード シャドウズ","アサクリ シャドウズ"],
  "Prince of Persia: The Lost Crown": ["プリンス オブ ペルシャ 失われた王冠"],
  "Yo-kai Watch 4": ["妖怪ウォッチ4","妖怪ウォッチ4++","妖怪ウォッチ"],
  "Yo-kai Watch 3": ["妖怪ウォッチ3"],
  "Yo-kai Watch 2": ["妖怪ウォッチ2"],
  "Yo-kai Watch 1": ["妖怪ウォッチ","妖怪ウォッチ1"],
  "Fate/Samurai Remnant": ["フェイト サムライレムナント","サムレム"],
  "Granblue Fantasy: Relink": ["グランブルーファンタジー リリンク","グラブルリリンク","リリンク"],
  "The Hundred Line: Last Defense Academy": ["The Hundred Line","ハンドレッドライン","ハンドレッドライン 最終防衛学園"],
  "Hades II": ["ハデス2","ハデスII","Hades 2"],
  "Hades": ["ハデス","ハデス1"],
  "Final Fantasy": ["ファイナルファンタジー1","FF1","FFI"],
  "Final Fantasy VII Remake Intergrade": ["ファイナルファンタジーVII リメイク インターグレード","FF7リメイク インターグレード","FF7Rインターグレード","FF7R"],
  "Hollow Knight: Silksong": ["ホロウナイト シルクソング","シルクソング"],
  "Armored Core V": ["アーマードコア5","AC5"],
  "Armored Core: Verdict Day": ["アーマードコア ヴァーディクトデイ","ACVD"],
  "God of War": ["ゴッド・オブ・ウォー","GOW"],
  "Monster Hunter Generations Ultimate": ["モンスターハンターダブルクロス","モンハンダブルクロス","MHXX"],
  "Monster Hunter Generations": ["モンスターハンタークロス","モンハンクロス","MHX"],
  "Monster Hunter Freedom Unite": ["モンスターハンターポータブル2nd G","MHP2G"],
  "Monster Hunter Freedom 2": ["モンスターハンターポータブル2nd","MHP2"],
  "Monster Hunter Portable 3rd": ["モンスターハンターポータブル3rd","MHP3"],
  "Resident Evil 4": ["バイオハザード4","バイオ4"],
  "Resident Evil 2 Remake": ["バイオハザード RE:2","バイオ2リメイク","RE2"],
  "Resident Evil 3 Remake": ["バイオハザード RE:3","バイオ3リメイク","RE3"],
  "Resident Evil Remake": ["バイオハザード リメイク","バイオ1リメイク"],
  "Resident Evil 0": ["バイオハザード0","バイオ0"],
  "The Legend of Zelda: Link's Awakening": ["ゼルダの伝説 夢をみる島","夢をみる島"],
  "The Legend of Zelda: Skyward Sword HD": ["ゼルダの伝説 スカイウォードソード HD","スカウォ"],
  "The Legend of Zelda: Echoes of Wisdom": ["ゼルダの伝説 知恵のかりもの","知恵のかりもの"],
  "The Legend of Zelda: Ocarina of Time": ["ゼルダの伝説 時のオカリナ","時のオカリナ","時オカ"],
  "The Legend of Zelda: Majora's Mask": ["ゼルダの伝説 ムジュラの仮面","ムジュラ"],
  "The Legend of Zelda: The Wind Waker HD": ["ゼルダの伝説 風のタクト HD","風のタクト","風タク"],
  "The Legend of Zelda: Twilight Princess HD": ["ゼルダの伝説 トワイライトプリンセス HD","トワプリ"],
  "The Legend of Zelda: A Link Between Worlds": ["ゼルダの伝説 神々のトライフォース2","神トラ2"],
  "The Legend of Zelda: A Link to the Past": ["ゼルダの伝説 神々のトライフォース","神トラ"],
  "The Legend of Zelda: The Minish Cap": ["ゼルダの伝説 ふしぎのぼうし"],
  "The Legend of Zelda: Oracle of Ages": ["ゼルダの伝説 ふしぎの木の実 時空の章"],
  "The Legend of Zelda: Oracle of Seasons": ["ゼルダの伝説 ふしぎの木の実 大地の章"],
  "The Legend of Zelda: Phantom Hourglass": ["ゼルダの伝説 夢幻の砂時計"],
  "The Legend of Zelda: Spirit Tracks": ["ゼルダの伝説 大地の汽笛"],
};

/* シリーズ名は各作品へ付与する。共有略称を一作品だけに割り当てない。 */
const JP_SERIES_ALIASES = [
  { pattern: /^Elden Ring\b/i, aliases: ["エルデンリング", "エルデン"] },
  { pattern: /^Dark Souls\b/i, aliases: ["ダークソウル", "ダクソ"], number: /^Dark Souls\s+([IVX]+|\d+)\b/i },
  { pattern: /^Armored Core\b/i, aliases: ["アーマードコア", "AC"], number: /^Armored Core\s+([IVX]+|\d+)\b/i },
  { pattern: /^Nioh\b/i, aliases: ["仁王"], number: /^Nioh\s+(\d+)\b/i },
  { pattern: /^The Legend of Zelda:/i, aliases: ["ゼルダの伝説", "ゼルダ"] },
  { pattern: /^(?:Super |New Super |Paper )?Mario\b/i, aliases: ["マリオ"] },
  { pattern: /^Mario Kart\b/i, aliases: ["マリオカート", "マリカ"], number: /^Mario Kart\s+(\d+)\b/i },
  { pattern: /^Animal Crossing:/i, aliases: ["どうぶつの森", "どう森"] },
  { pattern: /^Super Smash Bros\./i, aliases: ["大乱闘スマッシュブラザーズ", "スマブラ"] },
  { pattern: /^Pokemon\b/i, aliases: ["ポケットモンスター", "ポケモン"] },
  { pattern: /^Splatoon\b/i, aliases: ["スプラトゥーン", "スプラ"], number: /^Splatoon\s+(\d+)\b/i },
  { pattern: /^Metroid\b/i, aliases: ["メトロイド"] },
  { pattern: /^Kirby\b/i, aliases: ["星のカービィ", "カービィ"] },
  { pattern: /^Pikmin\b/i, aliases: ["ピクミン"], number: /^Pikmin\s+(\d+)\b/i },
  { pattern: /\bFinal Fantasy\b/i, aliases: ["ファイナルファンタジー", "FF"], number: /\bFinal Fantasy\s+([IVX]+|\d+)\b/i },
  { pattern: /^Dragon Quest\b/i, aliases: ["ドラゴンクエスト", "ドラクエ", "DQ"], number: /^Dragon Quest\s+([IVX]+|\d+)\b/i },
  { pattern: /^Kingdom Hearts\b/i, aliases: ["キングダムハーツ", "KH"], number: /^Kingdom Hearts\s+([IVX]+|\d+)\b/i },
  { pattern: /^NieR\b/i, aliases: ["ニーア"] },
  { pattern: /^Persona\b/i, aliases: ["ペルソナ", "P"], number: /^Persona\s+(\d+)\b/i },
  { pattern: /^(?:Like a Dragon|Yakuza)\b/i, aliases: ["龍が如く", "如く"] },
  { pattern: /^Monster Hunter\b/i, aliases: ["モンスターハンター", "モンハン", "MH"], number: /^Monster Hunter\s+(\d+)\b/i },
  { pattern: /^Monster Hunter Stories\b/i, aliases: ["モンスターハンターストーリーズ", "モンハンストーリーズ"], number: /^Monster Hunter Stories\s+(\d+)\b/i },
  { pattern: /^Devil May Cry\b/i, aliases: ["デビルメイクライ", "DMC"], number: /^Devil May Cry\s+(\d+)\b/i },
  { pattern: /^Resident Evil\b/i, aliases: ["バイオハザード", "バイオ", "RE"], number: /^Resident Evil\s+(\d+)\b/i },
  { pattern: /^Dragon's Dogma\b/i, aliases: ["ドラゴンズドグマ", "ドグマ", "DD"], number: /^Dragon's Dogma\s+(\d+)\b/i },
  { pattern: /^Onimusha\b/i, aliases: ["鬼武者"], number: /^Onimusha\s+(\d+)\b/i },
  { pattern: /^Hades\b/i, aliases: ["ハデス"], number: /^Hades\s+([IVX]+|\d+)\b/i },
  { pattern: /^Hollow Knight\b/i, aliases: ["ホロウナイト"] },
  { pattern: /^Ghostrunner\b/i, aliases: ["ゴーストランナー"], number: /^Ghostrunner\s+(\d+)\b/i },
  { pattern: /^God of War\b/i, aliases: ["ゴッドオブウォー", "GOW"], number: /^God of War\s+([IVX]+|\d+)\b/i },
  { pattern: /^Ghost of Tsushima\b/i, aliases: ["ゴーストオブツシマ", "ツシマ"] },
  { pattern: /^Marvel's Spider-Man\b/i, aliases: ["スパイダーマン"], number: /^Marvel's Spider-Man\s+(\d+)\b/i },
  { pattern: /^The Witcher\b/i, aliases: ["ウィッチャー"], number: /^The Witcher\s+(\d+)\b/i },
  { pattern: /^Grand Theft Auto\b/i, aliases: ["グランドセフトオート", "GTA"], number: /^Grand Theft Auto\s+([IVX]+|\d+)\b/i },
  { pattern: /^Red Dead Redemption\b/i, aliases: ["レッドデッドリデンプション", "RDR"], number: /^Red Dead Redemption\s+(\d+)\b/i },
  { pattern: /^Assassin's Creed\b/i, aliases: ["アサシンクリード", "アサクリ"] },
  { pattern: /^Prince of Persia\b/i, aliases: ["プリンスオブペルシャ"] },
  { pattern: /^Yo-kai Watch\b/i, aliases: ["妖怪ウォッチ"], number: /^Yo-kai Watch\s+(\d+)\b/i },
  { pattern: /^Granblue Fantasy\b/i, aliases: ["グランブルーファンタジー", "グラブル"] },
  { pattern: /^Darksiders\b/i, aliases: ["ダークサイダーズ"], number: /^Darksiders\s+([IVX]+|\d+)\b/i },
  { pattern: /^Remnant\b/i, aliases: ["レムナント"], number: /^Remnant\s+([IVX]+|\d+)\b/i },
  { pattern: /^The Surge\b/i, aliases: ["ザサージ"], number: /^The Surge\s+(\d+)\b/i },
  { pattern: /^Tales of\b/i, aliases: ["テイルズ", "テイルズオブ"] },
  { pattern: /^Ys\b/i, aliases: ["イース"], number: /^Ys\s+([IVX]+|\d+)\b/i },
  { pattern: /^Xenoblade Chronicles\b/i, aliases: ["ゼノブレイド"], number: /^Xenoblade Chronicles\s+(\d+)\b/i },
  { pattern: /^Fire Emblem\b/i, aliases: ["ファイアーエムブレム", "FE"] },
  { pattern: /^Street Fighter\b/i, aliases: ["ストリートファイター", "ストファイ", "スト", "SF"], number: /^Street Fighter\s+([IVX]+|\d+)\b/i },
  { pattern: /^Tekken\b/i, aliases: ["鉄拳"], number: /^Tekken\s+(\d+)\b/i },
  { pattern: /^Horizon (?:Zero Dawn|Forbidden West)\b/i, aliases: ["ホライゾン"] },
  { pattern: /^Silent Hill\b/i, aliases: ["サイレントヒル"], number: /^Silent Hill\s+(\d+)\b/i },
  { pattern: /^Alan Wake\b/i, aliases: ["アランウェイク"], number: /^Alan Wake\s+(\d+)\b/i },
  { pattern: /^Dead Space\b/i, aliases: ["デッドスペース"], number: /^Dead Space\s+(\d+)\b/i },
];

const ROMAN_NUMBERS = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8,
  IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16,
};

function normJP(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase()
    .replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .replace(/[\s\p{P}]/gu, "");
}

function gameSearchTerms(title) {
  const terms = [title, ...(JP_ALIASES[title] || [])];
  for (const series of JP_SERIES_ALIASES) {
    if (!series.pattern.test(title)) continue;
    terms.push(...series.aliases);
    const match = series.number?.exec(title);
    if (!match) continue;
    const number = /^\d+$/.test(match[1]) ? Number(match[1]) : ROMAN_NUMBERS[match[1].toUpperCase()];
    if (number == null) continue;
    terms.push(title.replace(match[0], match[0].slice(0, -match[1].length) + number));
    for (const alias of series.aliases) {
      terms.push(alias + number, alias + match[1]);
    }
  }
  return [...new Set(terms.map(normJP).filter(Boolean))];
}

const JP_SEARCH_INDEX = new Map(GAMES.map(g => [g.title, gameSearchTerms(g.title)]));

/* FF1 が FF10/FF16 に一致するなど、数字の途中での一致を避ける。 */
function searchTermMatches(term, query) {
  for (let at = term.indexOf(query); at !== -1; at = term.indexOf(query, at + 1)) {
    if (!/\d$/.test(query) || !/\d/.test(term[at + query.length] || "")) return true;
  }
  return false;
}

/* 両入力欄で使う共通検索。完全一致、前方一致、部分一致の順で安定ソート。 */
function searchGames(value, games = GAMES) {
  const query = normJP(value);
  if (!query) return [];
  return games.map((g, index) => {
    const terms = JP_SEARCH_INDEX.get(g.title) || gameSearchTerms(g.title);
    const matches = terms.filter(term => searchTermMatches(term, query));
    const rank = matches.some(term => term === query) ? 0
      : matches.some(term => term.startsWith(query)) ? 1 : 2;
    return { g, index, rank, matched: matches.length > 0 };
  }).filter(hit => hit.matched)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(hit => hit.g);
}

function jpDisplayName(game) {
  return (JP_ALIASES[game.title] || [])[0] || game.title;
}
