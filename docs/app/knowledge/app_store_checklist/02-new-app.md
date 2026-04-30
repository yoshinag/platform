# 02. 新規アプリの初期セットアップ（1 アプリにつき 1 回）

新しいアプリを App Store に出すときに、1.0 申請の前にやっておく初期設定。**一度終わったら、そのアプリではこのファイルは原則触らない**（カテゴリ変更や Privacy Policy URL 変更時のみ戻ってくる）。

> 進捗管理ルールは [`README.md`](README.md) を参照。

---

## 進捗サマリ（AI 自動更新）

- **アプリ名**: TBD
- **Bundle ID**: TBD
- **SKU**: TBD
- **Primary Category**: TBD
- **完了**: 0 / 21
- **直近のブロッカー**: なし
- **最終更新**: -

---

## 1. Bundle ID と Capabilities

Apple Developer Portal → `Identifiers`。

- [ ] App ID（Bundle ID）を作成（例: `com.example.myapp`）
- [ ] 必要な Capabilities を有効化（Push / Sign in with Apple / iCloud / Associated Domains / In-App Purchase など）
- [ ] Sign in with Apple を Web でも使うなら Service ID / Domain 設定

> ⚠️ **Bundle ID はあとから変更不可**。命名は慎重に（逆ドメイン形式、サブドメインを切れる柔軟さがあると後で楽）。
>
> ⚠️ **Capabilities は最小限**。使わないものをオンにすると Reject 対象（Guideline 5.1.1）。

---

## 2. Provisioning Profile

- [ ] App Store Provisioning Profile を作成（自動管理なら自動生成）

> 💡 個人開発なら Xcode の *Automatically manage signing* に任せて OK。手動管理は CI / 複数開発者で秘密鍵を共有するときに必要になる程度。

---

## 3. App Store Connect でアプリレコード作成

App Store Connect → My Apps → 「+」→ 新規 App。

- [ ] **Platform** を選択（iOS / iPadOS / macOS / tvOS / visionOS / watchOS）
- [ ] **Name**（30 文字以内、App Store 表示名。あとで変更可だが審査必要）
- [ ] **Primary Language** 設定（ローカライズの基準言語）
- [ ] **Bundle ID** を選択（前項で作成したもの）
- [ ] **SKU** を入力（社内管理用 ID、半角英数字、**あとから変更不可**）
- [ ] **User Access**（Full / Limited）を設定

---

## 4. App Information

左メニュー → App Information。**言語ごとに別々に入れる**項目があるので、ローカライズ対象の各言語で記入する。

- [ ] **Subtitle**（30 文字、検索結果の補助タイトル）
- [ ] **Privacy Policy URL**（必須、HTTPS かつ常時アクセス可能）
- [ ] **Primary Category** / **Secondary Category** を選択
- [ ] **Content Rights**: 第三者コンテンツを含むかどうか申告
- [ ] **Age Rating** アンケートに回答（暴力 / 性的表現 / 賭博 / 薬物 / アルコール / タバコ / 衝撃的なテーマなど）
- [ ] **License Agreement**: デフォルト EULA で OK（カスタムを使うなら別途文面を用意）

---

## 5. Pricing and Availability

- [ ] **Price**（Free / Tier 1〜）を選択
- [ ] **Availability**: 配信地域選択（全 175 ヵ国 / 特定地域 / 中国本土除外など）
- [ ] **Pre-Orders** を使うか（任意、最大 1 年先まで予約受付可能）
- [ ] Volume Purchase Program（教育 / B2B 一括販売）を有効化するか
- [ ] Educational Discount を有効化するか

> 💡 **初回は無料 / 全地域**から始めて、運用が安定してから絞るのが安全。中国本土だけは ICP ライセンスなど別要件があるので、最初は外しておくのも一手。

---

## 6. App Privacy 初回入力（栄養成分表示）

App Store Connect → App Privacy。**収集データの種類と用途**を申告する。

- [ ] 使用している全 SDK のプライバシー情報を確認（Firebase / GA / AdMob / Sentry など）
- [ ] 「データを収集しない」と宣言する場合: **本当にゼロ**か再確認（解析 SDK が入っていないか）
- [ ] 収集する場合、データタイプ × 用途のマトリクスを記入
- [ ] Privacy Policy URL の内容と App Privacy の申告が**一致**しているか確認

> ⚠️ **第三者 SDK の収集も自分のアプリの収集として申告する**のが落とし穴。SDK のデータ収集ドキュメントを確認すること。
>
> 💡 SDK 追加時に再チェックが必要。詳しくは [`03-release.md`](03-release.md) §3 のプライバシーセクション。

---

## ノート / ブロッカー（自由記入）

> 命名根拠 / カテゴリ選択の理由など、初期設定時の意思決定を残しておくと、後にチーム拡大したときに参照できる。

(まだ何も記録なし)
