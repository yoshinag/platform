# Google Play 申請チェックリスト（分割版）

Android アプリを Google Play に申請する作業を、**頻度ごと**にファイル分割したチェックリスト集。AI（Claude / Copilot など）と一緒に進めることを前提とした構成。

iOS（Apple App Store）版は [`../app_store_checklist/`](../app_store_checklist/) を参照。

---

## ファイルの使い分け

| ファイル | 頻度 | いつ使う |
| --- | --- | --- |
| [`01-account.md`](01-account.md) | **一度きり** | Google Play Console アカウントを新規作成した最初のとき |
| [`02-new-app.md`](02-new-app.md) | **1 アプリにつき 1 回** | 新しいアプリを Google Play に出すとき（1.0 申請前の初期セットアップ） |
| [`03-release.md`](03-release.md) | **毎リリース** | バージョンアップごと（1.0, 1.1, 1.2 ...） |
| [`99-troubleshooting.md`](99-troubleshooting.md) | **必要時** | Reject 対応 / Policy 違反 / アップロード失敗 / 公開停止対応時 |

> 💡 **使い方**: 新規アプリの 1.0 申請なら `01-account.md` → `02-new-app.md` → `03-release.md` の順で頭から潰す。2 個目以降のアプリでは `01` をスキップ。バージョンアップでは `03` だけ使う。

---

## 全体フロー

```
[01-account.md]
   Google Play Console 開発者登録（$25 一回）
   + Payments プロファイル / 本人確認 / D-U-N-S（組織のみ）
              │
              ▼ (一度終わったら不要)
[02-new-app.md]
   Application ID（パッケージ名）決定
   + アプリレコード作成
   + Play App Signing 鍵設定
   + ストア掲載情報の枠 / 国 / カテゴリ
              │
              ▼ (アプリ 1 つにつき 1 回)
[03-release.md]
   ストアページ（アイコン / スクショ / 説明文）
   + Data Safety（データセーフティ）
   + Content Rating（IARC アンケート）
   + AAB ビルド & 署名
   + Internal / Closed / Open テスト
   + Production 提出 → 審査
   + リリース後の確認 / Pre-launch report
              │
              ▼ (毎リリース繰り返し)

   ※ Reject / Policy 違反 → [99-troubleshooting.md]
```

---

## iOS との主な違い（Android 特有のポイント）

- **登録費用**: $25 の**一回払い**（Apple は年 $99）
- **個人アカウントは 14+ 日のクローズドテスト必須**（2023 年 8 月以降、本番リリースの前提条件）
- **Application ID（パッケージ名）はあとから変更不可**（iOS の Bundle ID と同様）
- **AAB（Android App Bundle）が必須**（2021 年 8 月以降の新規アプリ。APK は Internal Testing と Wear/TV のみ可）
- **Play App Signing**（Google が署名鍵を管理）が**強く推奨**、新規アプリは事実上必須
- **Target API level の年次更新義務**（毎年 8 月末までに最新 API レベル -1 にしないと新規 / 更新が拒否される）
- **Data Safety**（iOS の App Privacy 相当）、**Privacy Manifest 相当は不要**だが、Play Integrity / SDK の挙動に注意
- **ATT は無し**、代わりに `com.google.android.gms.permission.AD_ID` 権限と Privacy Policy 整合
- **Pre-launch report**（Firebase Test Lab で自動クラッシュ検査、AAB アップロード時に自動実行）
- **段階的公開**（Staged rollout）は数値指定で柔軟に変更可能
- **審査時間は数時間〜7 日**、初回や Sensitive な機能を含むと長引く

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
- [x] 本人確認書類を提出
  > note(2026-05-01): パスポート画像で 2 日後に承認
```

### AI と進める基本ワークフロー

1. ユーザー「Google Play 申請の続きやりたい」
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

- [Developer Program Policies](https://play.google.com/about/developer-content-policy/) — 開発者プログラムポリシー本体
- [Play Console Help](https://support.google.com/googleplay/android-developer/) — Play Console 操作マニュアル
- [Material Design](https://m3.material.io/) — UI/UX ガイドライン
- [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469) — データセーフティ申告ガイド
- [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878) — Target SDK 年次更新ルール
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756) — Play App Signing 公式ドキュメント
- [App Bundle](https://developer.android.com/guide/app-bundle) — AAB 公式ドキュメント
- [Pre-launch report](https://support.google.com/googleplay/android-developer/answer/9845853) — Pre-launch report 解説
- [Permissions declaration form](https://support.google.com/googleplay/android-developer/answer/9214102) — 機密権限の宣言フォーム
- [IARC rating questionnaire](https://support.google.com/googleplay/android-developer/answer/9859655) — コンテンツレーティング
