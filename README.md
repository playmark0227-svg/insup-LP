# Insup Night LP

株式会社Insupが主催する食事交流会「Insup Night」のランディングページです。
HTML / CSS / JavaScript だけで動く静的サイトです（ビルド不要）。

## 毎月の更新方法

更新は **`assets/js/config.js` だけ** を書き換えればOKです。

| やりたいこと | 書き換える場所 |
| --- | --- |
| 今月の開催日を変える | `dates: ["2026-11-26"]` の日付を書き換える（2回ある月は `["2026-12-03", "2026-12-17"]` のように書く）。曜日は自動で表示され、過ぎた日付は自動で「開催終了」になる。 |
| 定期開催のルールを表示する | `regularSchedule` の文章を書き換える（例：`"毎月 第1・第3木曜日 開催"`） |
| 申込フォームをつなぐ | `formUrl` にフォームのURLを入れる。空のあいだは、ボタンを押すと「準備中」と表示される。 |
| キャンセル規定を表示する | `cancelPolicy` に文章を入れる。開催概要の下に「※」付きで表示される。 |
| 参加者の声を入れる | `voices` の `title` / `text` / `name` / `profile` / `photo` に入力する。空欄のあいだは「インタビュー準備中」と表示される。 |
| メンバー紹介を変える | `members` の `name` / `role` / `comment` / `photo` を書き換える |
| ストーリーズ用の画像を差し替える | `assets/img/` に画像を入れて、`storyImage` のファイル名を書き換える |

## ファイル構成

```
index.html            ページ本体
assets/css/style.css  デザイン
assets/js/config.js   ★更新用の設定（開催日・フォームURLなど）
assets/js/main.js     動き（モーダル、追従ボタン、画像保存など）
assets/img/           画像
```

## ローカルで確認する

```bash
python3 -m http.server 8080
```

ブラウザで http://localhost:8080 を開いてください。
