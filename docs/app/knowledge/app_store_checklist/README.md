# Apple App Store 申請チェックリスト（分割版）

iOS アプリを App Store に申請する作業を、**頻度ごと**にファイル分割したチェックリスト集。AI（Claude / Copilot など）と一緒に進めることを前提とした構成。

ブラウザで一覧したい場合は HTML 版（`../app_store_submission_checklist.html`）を参照。

---

## ファイルの使い分け

| ファイル | 頻度 | いつ使う |
| --- | --- | --- |
| [`01-account.md`](01-account.md) | **一度きり** | Apple Developer アカウントを新規作成した最初のとき |
| [`02-new-app.md`](02-new-app.md) | **1 アプリにつき 1 回** | 新しいアプリを App Store に出すとき（1.0 申請前の初期セットアップ） |
| [`03-release.md`](03-release.md) | **毎リリース** | バージョンアップごと（1.0, 1.1, 1.2 ...） |
| [`99-troubleshooting.md`](99-troubleshooting.md) | **必要時** | Reject 対応 / アップロード失敗（ITMS-XXX）時 / Resolution Center 対応時 |

> 💡 **使い方**: 新規アプリの 1.0 申請なら `01-account.md` → `02-new-app.md` → `03-release.md` の順で頭から潰す。2 個目以降のアプリでは `01` をスキップ。バージョンアップでは `03` だけ使う。

---

## 全体フロー

```
[01-account.md]
   Apple Developer Program 加入
   + 各種契約・銀行情報・証明書類
              │
              ▼ (一度終わったら不要)
[02-new-app.md]
   Bundle ID 発行
   + App Store Connect でアプリレコード作成
   + カテゴリ / 価格 / 配信地域
              │
              ▼ (アプリ 1 つにつき 1 回)
[03-release.md]
   ストアページ更新 / スクショ
   + プライバシー全チェック
   + Xcode で Archive → Upload
   + TestFlight (任意)
   + App Review 提出
   + リリース後の確認
              │
              ▼ (毎リリース繰り返し)

   ※ Reject されたら → [99-troubleshooting.md]
```

---

## AI 進捗管理ルール

各ファイル共通のルール。

### 完了マーク

- `- [ ]` 未着手
- `- [x]` 完了
- `- [~]` 着手中だがブロックあり（独自運用）
- `- [-]` 該当しない / スキップ（独自運用）

### 備考の残し方

タスク行の直下にインデントしたブロッククォートで残す:

```markdown
- [x] D-U-N-S 番号取得
  > note(2026-05-01): D&B のフォームから 5/1 申請、2 週間待ち
```

### AI と進める基本ワークフロー

1. ユーザー「App Store 申請の続きやりたい」
2. AI: README.md を読んで現在のフェーズを把握 → 該当ファイルを Read
3. AI: 最初の `- [ ]` を見つけて提示、完了条件を一緒に確認
4. ユーザー: 完了報告
5. AI: 該当行を Edit で `- [x]` に変更、必要なら note を追記
6. AI: 該当ファイルの「進捗サマリ」セクションを更新

### AI が触る範囲

- ✅ チェックボックスの `[ ]` ↔ `[x]` の切り替え
- ✅ 各ファイル冒頭の「進捗サマリ」セクションの更新
- ✅ 各ファイル末尾の「ノート / ブロッカー」への追記
- ✅ タスク行直下への `> note(日付): ...` 追記
- ❌ それ以外の本文（手順説明・表・ASCII 図）は触らない

---

## 参考リンク

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — 審査ガイドライン本体
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) — UI/UX ガイドライン
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/) — Connect 操作マニュアル
- [Privacy Manifest Files](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files) — Privacy Manifest 公式ドキュメント
- [Describing use of required reason API](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api) — Reason 値一覧
- [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) — App Privacy 申告ガイド
- [Contact Us / Expedited Review](https://developer.apple.com/app-store/contact/) — 緊急審査リクエスト窓口
- [Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/) — デフォルト使用許諾契約
