# GAMEFINDER 収益化・運用メモ

## 現在の状態

- 忍者AdMaxの既存タグを利用。診断ページでは1枠をトップページと診断結果で表示し、回答中は隠します。結果画面では1位の後、残りの候補の前に表示します。新しいゲームの選び方ガイドにも同じタグを1枠配置しています。各ページ内でタグを複製したり、自動再読み込みしたりしていません。
- 作品のAmazon・楽天市場・Steam検索リンクは、現在は通常のリンクです。このリンク自体から紹介料は発生しません。商品の取扱いや価格は保証しません。
- 広告の実際の配信や収益は、忍者AdMaxの管理画面で確認してください。配置の変更だけで収益増加は保証できません。

## 提携後に商品リンクを入れる方法

1. 利用したいサービスにサイトを登録し、審査・提携条件、対象サイト、表示義務を確認します。
2. 各サービスの公式ツールで、紹介する作品・版の広告リンクを作成します。IDやURLを推測して作らず、発行されたリンクをそのまま使用します。
3. `app.js` の冒頭にある `AFFILIATE_LINKS` に、`games1000.js` に載っている**英語の作品名と完全一致**するキーで追加します。下記は構造の例であり、実際に使えるリンクではありません。

```js
const AFFILIATE_LINKS = Object.freeze({
  "Elden Ring": {
    amazon: "https://example.com/affiliate-link-issued-by-program",
    rakuten: "https://example.com/another-issued-link"
  }
});
```

4. 有効なHTTPSリンクを登録した作品では、そのショップの検索ボタンが広告リンクに切り替わり、「広告」表示と `rel="sponsored"` が付きます。リンクを登録していない作品・ショップは、これまでどおり通常の検索リンクです。サイト冒頭と結果画面にも広告の説明が出ます。Amazonの場合はアソシエイトの表示文も出ます。
5. 実際のリンク先が正しい作品・版であること、表示・プライバシーポリシーが最新のプログラム規約や取扱いに合うことを確認して公開します。テスト中も自分の広告はクリックしないでください。

参考：
- [忍者AdMax 利用規約](https://www.ninja.co.jp/rule/admax)
- [Amazonアソシエイト・プログラム運営規約](https://affiliate.amazon.co.jp/help/operating/agreement)
- [楽天アフィリエイトのPR表示に関する案内](https://affiliate.rakuten.co.jp/guideline/stealth_marketing_regulation/)
- [Googleのリンク属性の説明](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)

## 効果を見る

- ページ別の広告効果を分けて見たい場合は、忍者AdMaxでガイド用の広告枠を新規発行し、そのタグに差し替えます。現状の同じタグでは集計は合算されます。
- 忍者AdMaxで表示回数・収益・表示回数あたりの収益を、変更前後で同じ期間幅で確認します。アクセス数や広告在庫も変動するため、数値の増減を配置だけの効果と決めつけないでください。
- 検索流入を見る場合はGoogle Search Consoleにサイトを登録し、`https://shikaku-route-jp.github.io/gamefinder/sitemap.xml` を送信できます。サイトマップ登録や新しいガイドによる検索順位・流入増は保証されません。
