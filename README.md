# Insup Night LP

株式会社Insupが主催する食事交流会「Insup Night」のランディングページです。
HTML / CSS / JavaScript だけで動く静的サイトです（ビルド不要）。

## 毎月の更新方法

更新は **`assets/js/config.js` だけ** を書き換えればOKです。

| やりたいこと | 書き換える場所 |
| --- | --- |
| 開催日（毎月 第1・第3木曜日） | 書き換え不要。`schedule` のルールから毎月の日付が自動で計算され、今月の開催日と「その次の開催日」が表示される。過ぎた日は自動で「開催終了」になる。 |
| 特別回を追加する／お休みにする | 特別回は `dates`、お休みは `skipDates` に "年-月-日" で書く。 |
| 定期開催の文章を変える | `regularSchedule` の文章を書き換える。 |
| 申込フォームをつなぐ | `formUrl` にGoogleフォームのURLを入れる。空のあいだは、申込ボタンを押すと「準備中」と表示される。開催日を変えたら、Googleフォームの「参加希望日」の選択肢も更新する。 |
| キャンセル規定を表示する | `cancelPolicy` に文章を入れる。開催概要の下に「※」付きで表示される。 |
| 参加者の声を入れる | `voices` の `title` / `text` / `name` / `profile` / `photo` に入力する。空欄のあいだは「インタビュー準備中」と表示される。 |
| メンバー紹介を変える | `members` の `name` / `role` / `comment` / `photo` を書き換える |
| ストーリーズ用画像の「次回」の日付を更新する | `node tools/story-image/render.js` を実行する。config.js の開催日から次回を計算し、`assets/img/insup-night-flyer.jpg` と `insup-night-flyer-thumb.jpg` を作り直す（Playwright が必要）。 |
| ストーリーズ用の画像を別の画像に差し替える | `assets/img/` に画像を入れて、`storyImage` のファイル名を書き換える |

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
