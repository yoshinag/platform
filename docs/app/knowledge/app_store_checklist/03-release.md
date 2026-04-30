# 03. リリース提出フロー（毎リリース）

各バージョン（1.0, 1.1, 1.2 ...）を App Store に出すたびに使うチェックリスト。アップロード〜審査提出〜リリースまで全部入り。

> 進捗管理ルールは [`README.md`](README.md) を参照。
> Reject されたら [`99-troubleshooting.md`](99-troubleshooting.md) へ。

---

## 進捗サマリ（AI 自動更新）

- **対象アプリ**: TBD
- **Version**: TBD（例: 1.0.0）
- **Build**: TBD（CFBundleVersion）
- **現フェーズ**: 未開始
- **完了**: 0 / 60
- **直近のブロッカー**: なし
- **最終更新**: -

---

## 全体フロー

```
[ストアページ更新]
        │
        ▼
[プライバシー全チェック]   ← App Privacy / Privacy Manifest / ATT / Usage Description
        │
        ▼
[Xcode 事前確認]
        │
        ▼
[Archive → Validate → Upload]
        │
        ▼
[ビルド処理待ち (5〜30 分) + Export Compliance]
        │
        ▼
[(任意) TestFlight でベータ確認]
        │
        ▼
[App Review に提出]
        │
        ▼
[Waiting → In Review → Approved / Rejected]
        │
        ▼ (承認後)
[リリース後の確認]
```

---

## 1. ストアページ（アイコン・スクショ・テキスト）

### 1.1. アイコン

- [ ] App Store 用 **1024 × 1024 PNG**（角丸なし、透過なし、PNG 形式のみ）
- [ ] アプリ内アイコンを各サイズで書き出し（ツール `../../tool/ios_icon.html` で一括生成可能）
- [ ] マスター画像とストアアイコンの**デザインを完全一致**させる（不一致は Reject 対象）
- [ ] Tinted Icon（iOS 18+ ダークモード用）も用意（任意）

### 1.2. スクリーンショット

| デバイス | 解像度 | 必須/任意 |
| --- | --- | --- |
| iPhone 6.9" (16 Pro Max など) | 1290 × 2796 | iPhone 対応なら必須 |
| iPhone 6.5" (11 Pro Max など) | 1242 × 2688 / 1284 × 2778 | 任意（推奨） |
| iPad 13" (Pro 13") | 2064 × 2752 | iPad 対応なら必須 |
| iPad 12.9" (Pro 第 2-6 世代) | 2048 × 2732 | 任意 |

- [ ] 最大 10 枚 / デバイスサイズ（最初の 3 枚が検索結果プレビューで表示される）
- [ ] ツール `../../tool/screenshot.html` で各サイズに変換
- [ ] App Preview 動画（任意、最大 3 本、15-30 秒、M4V/MP4/MOV、デバイス録画推奨）
- [ ] ステータスバーのモック（時刻 9:41 / 電池 100% / 電波フル）が定番

### 1.3. テキスト

- [ ] **Promotional Text**（170 文字、リリース後も**審査なしで変更可能**。期間限定キャンペーン告知などに）
- [ ] **Description**（4000 文字、最初の数行が「もっと読む」前に表示される）
- [ ] **Keywords**（100 文字、カンマ区切り、競合アプリ名や Apple 商標は禁止）
- [ ] **Support URL**（必須、問い合わせ先 / FAQ ページ）
- [ ] **Marketing URL**（任意、製品ランディングページ）
- [ ] **What's New**（バージョンアップ時、4000 文字。新規 1.0 では空欄可）

### 1.4. ローカライズ

- [ ] 対応言語ごとに、Subtitle / Description / Keywords / Promotional Text を翻訳
- [ ] スクリーンショット内の文字も該当言語にローカライズ（推奨）
- [ ] アプリ内ローカライズと一致しているか確認

---

## 2. プライバシー全チェック（最重要）

近年 Reject の最大要因。**4 つすべて**を整合させる必要がある。

### 2.1. App Privacy（栄養成分表示）の再確認

新規アプリの初回入力は [`02-new-app.md`](02-new-app.md) §6 で済んでいる前提。**SDK 追加 / 削除があった場合のみ更新**。

- [ ] 前回リリースから追加した SDK のプライバシー情報を確認
- [ ] 削除した SDK の収集項目を申告から外したか確認
- [ ] App Privacy 申告と Privacy Policy URL の内容が**一致**しているか

### 2.2. Privacy Manifest（PrivacyInfo.xcprivacy）

2024 年 5 月以降、サードパーティ SDK を使うアプリでは `PrivacyInfo.xcprivacy` の同梱が必須。アップロード時にチェックされる。

- [ ] アプリ本体に `PrivacyInfo.xcprivacy` が含まれている
- [ ] **NSPrivacyTracking**: トラッキングを行うか（true / false）
- [ ] **NSPrivacyTrackingDomains**: トラッキング用ドメイン一覧（ATT 許可がない場合 SKAdNetwork に強制される）
- [ ] **NSPrivacyCollectedDataTypes**: 収集データの種類（App Privacy と整合させる）
- [ ] **NSPrivacyAccessedAPITypes**: 使用 API と Reason（UserDefaults / FileTimestamp / SystemBoot / DiskSpace / ActiveKeyboards）
- [ ] 使用しているサードパーティ SDK が Privacy Manifest を含んでいるか（Apple 指定の SDK は**署名された** Privacy Manifest 必須）
- [ ] アップロード後、ITMS-91053 などの警告メールが来ていないか確認

> ⚠️ **典型的な Reason 値**: `UserDefaults` なら `CA92.1`（同じアプリ内で書き読み）、`FileTimestamp` なら `C617.1`（自分が作ったファイル）。Apple のドキュメント *"Describing use of required reason API"* に対応表がある。

### 2.3. ATT / Usage Description

`Info.plist` に Usage Description（使用理由文）を入れていない API を呼ぶとアプリがクラッシュする。**使う API すべて**に対応する文言を必ず入れる。

- [ ] IDFA（広告識別子）を使う場合: `NSUserTrackingUsageDescription` + ATT プロンプト実装
- [ ] 子ども向けアプリでは ATT は使わない（`NSUserTrackingUsageDescription` も入れない）
- [ ] `NSCameraUsageDescription`（カメラ）
- [ ] `NSMicrophoneUsageDescription`（マイク）
- [ ] `NSPhotoLibraryUsageDescription` / `NSPhotoLibraryAddUsageDescription`（写真ライブラリ）
- [ ] `NSLocationWhenInUseUsageDescription` / `NSLocationAlwaysAndWhenInUseUsageDescription`（位置情報）
- [ ] `NSContactsUsageDescription`（連絡先）
- [ ] `NSCalendarsUsageDescription` / `NSRemindersUsageDescription`（カレンダー / リマインダー）
- [ ] `NSMotionUsageDescription`（モーションセンサー）
- [ ] `NSBluetoothAlwaysUsageDescription`（Bluetooth）
- [ ] `NSLocalNetworkUsageDescription`（ローカルネットワーク、iOS 14+）
- [ ] **説明文は具体的に**: 「機能のため」では Reject される。「○○機能で△△するために使用します」と書く

---

## 3. ビルド作成とアップロード

### 3.1. Xcode 側の事前確認

- [ ] **CFBundleShortVersionString**（マーケティングバージョン、例: `1.2.0`）を設定
- [ ] **CFBundleVersion**（ビルド番号）を**単調増加**させる（過去と同じ番号は再アップロード不可）
- [ ] Build Configuration: **Release**
- [ ] Team / Bundle Identifier 確認
- [ ] Code Signing が正しく動いている（Automatic 推奨）
- [ ] Capabilities が必要な分だけ ON（過剰だと Reject 対象）
- [ ] `Info.plist` の Usage Description が全て埋まっている
- [ ] `PrivacyInfo.xcprivacy` がターゲットに含まれている
- [ ] Debug 用コード（`print` のテスト出力 / デバッグメニュー / テストアカウントの自動入力）が Release ビルドで除去されている
- [ ] SwiftUI Preview 用コードが Release ビルドに混入していないか確認
- [ ] Strip Debug Symbols 設定 + dSYM 生成（クラッシュ解析用）

### 3.2. Archive とアップロード

- [ ] スキーム → デスティネーションを **Any iOS Device (arm64)** に
- [ ] `Product → Archive`
- [ ] Organizer で **Validate App**（事前検証、署名 / Privacy Manifest など事前チェック）
- [ ] `Distribute App → App Store Connect → Upload`
- [ ] アップロード時に **dSYM を含める**にチェック（クラッシュレポートのシンボリケーション用）
- [ ] CLI なら `xcodebuild archive` + `xcodebuild -exportArchive` + `xcrun altool / notarytool`

### 3.3. 処理待ち と Export Compliance

- [ ] アップロード完了後、App Store Connect で **「処理中」** → 5〜30 分待つ
- [ ] **Export Compliance**（暗号化使用申告）に回答
- [ ] HTTPS / 標準暗号化のみなら `Info.plist` に `ITSAppUsesNonExemptEncryption = NO` を入れて毎回の質問を省略
- [ ] 処理失敗メールが来ていないか確認（来ていたら [`99-troubleshooting.md`](99-troubleshooting.md) §2 で ITMS コード対応）

---

## 4. TestFlight（任意・推奨）

本番審査の前に身内 / ベータユーザーに配って動作確認するフェーズ。新規 1.0 では本番と同じビルドを TestFlight で先にテストするのが定石。

- [ ] アップロード済みビルドに対し Export Compliance 回答済み
- [ ] **内部テスター**（最大 100 人、App Store Connect の Users 招待）— 即配信可能、ベータ審査不要
- [ ] **外部テスター**（最大 10,000 人、メール / 公開リンクで招待）— 初回はベータ審査必要（24-48h）
- [ ] Test Information を記入（Beta App Description / Email / Feedback URL / What to Test）
- [ ] ベータビルドの有効期限は 90 日（過ぎると新ビルドのアップロードが必要）
- [ ] クラッシュ / フィードバックを TestFlight アプリ経由で受領

---

## 5. App Review への提出

App Store Connect → アプリ → 「+ Version or Platform」でバージョンを作成（または既存バージョンに対してビルドを紐付け）。

- [ ] **Build** を選択（処理済みのビルドが選択肢に出る）
- [ ] **Version Information**（What's New / Description / Keywords / etc.）の最終確認
- [ ] **App Review Information** セクション
  - [ ] サインインが必要なら **Demo Account**（必須、確実に動くアカウント）を提供
  - [ ] **Notes** に審査担当者向けの注意事項を記入（特殊機能の使い方、外部 API 依存、テスト手順など）
  - [ ] **Contact Information**（First / Last / Phone / Email）— Apple からの問い合わせに使われる
  - [ ] **Attachment**（任意、動作証明動画 / 補足資料）
- [ ] **Version Release** オプションを選択
  - [ ] Manually release（手動。自分でボタン押す）
  - [ ] Automatically release（承認後即リリース）
  - [ ] Scheduled release（指定日時、PT/UTC 注意）
- [ ] **Phased Release**（段階的リリース）を有効化するか — 7 日間で 1% → 2% → 5% → 10% → 20% → 50% → 100%
- [ ] **Submit for Review** をクリック

> ⚠️ **新規アプリ（1.0）は通常より審査が厳しい**。説明文 / スクショ / 機能のすべてが整合していること、Demo Account が完璧に動くことを直前に確認。提出後 24-48 時間で *In Review* → 結果通知。

---

## 6. リリース後の確認

- [ ] App Store でアプリページが表示されているか確認（反映に最大 24 時間）
- [ ] 実機で App Store からダウンロードして起動確認
- [ ] Phased Release 中なら毎日％を確認、重大なクラッシュが出たら**停止** or **緊急アップデート**
- [ ] App Analytics で DAU / インプレッション / コンバージョン率を確認
- [ ] Xcode Organizer の Crashes でクラッシュレポート確認（dSYM 上げ忘れていなければシンボリケーションされる）
- [ ] Reviews & Ratings を監視、低評価レビューには Developer Response で返信
- [ ] 問題発生時は **Expedited Review**（緊急審査リクエスト、ユーザー影響を明記）を申請

---

## ノート / ブロッカー（自由記入）

> リリースごとに記録する作業ログ。次回リリース時に同じ罠を踏まないよう、ハマったところは詳しめに残す。

(まだ何も記録なし)
