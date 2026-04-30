# 02. 新規アプリの初期セットアップ（1 アプリにつき 1 回）

新しいアプリを Google Play に出すときに、1.0 申請の前にやっておく初期設定。**一度終わったら、そのアプリではこのファイルは原則触らない**（カテゴリ変更や Privacy Policy URL 変更時のみ戻ってくる）。

> 進捗管理ルールは [`README.md`](README.md) を参照。

---

## 進捗サマリ（AI 自動更新）

- **アプリ名**: TBD
- **Application ID（パッケージ名）**: TBD
- **Default language**: TBD
- **App or Game**: TBD
- **Category**: TBD
- **完了**: 0 / 24
- **直近のブロッカー**: なし
- **最終更新**: -

---

## 1. Application ID（パッケージ名）の決定

Android Studio / `build.gradle.kts`。

- [ ] **applicationId** を決定（例: `com.example.myapp`、逆ドメイン形式）
- [ ] `namespace`（Kotlin パッケージ）を applicationId に揃える（揃えなくても動くが混乱の元）
- [ ] 商標・他社アプリと被らないか [Play ストアで検索](https://play.google.com/store/search) で確認

> ⚠️ **applicationId はあとから変更不可**。命名は慎重に（逆ドメイン形式、サブドメインを切れる柔軟さがあると後で楽）。
>
> ⚠️ Application ID と Package Name は同じ意味で使われる。一度 Play に登録すると別アプリ扱いに変えられない。テスト用に `.debug` サフィックスを使うのは OK（applicationIdSuffix ".debug"）。

---

## 2. Play Console でアプリレコード作成

Play Console → `すべてのアプリ` → 「アプリを作成」。

- [ ] **アプリ名**（30 文字、Play ストア表示名。あとで変更可）
- [ ] **デフォルト言語**（Default language）を選択（ローカライズの基準言語）
- [ ] **アプリ / ゲーム**の区分（あとで変更可）
- [ ] **無料 / 有料**の区分（**有料 → 無料は変更可、無料 → 有料は不可**）
- [ ] デベロッパー プログラム ポリシーと米国輸出法の宣言にチェック

> ⚠️ **無料で公開した後に有料化はできない**。有料化の可能性があるなら最初から有料 → ストアでは Promo Code / Sale で実質無料配布する手もある。

---

## 3. Play App Signing 設定

Play Console → `リリース` → `設定` → `アプリ署名`。

- [ ] **Play App Signing を有効化**（新規アプリは事実上必須）
- [ ] アップロード鍵を作成 or 既存を選択（Android Studio の `Build → Generate Signed Bundle/APK` で `.jks` 生成）
- [ ] アップロード鍵の証明書（`.pem` または `keytool -export` での出力）を Play Console にアップロード
- [ ] 紛失時の対処手順を確認（Play サポートにアカウント認証で交代申請、24-48h）

> 💡 **アップロード鍵 ≠ 本番署名鍵**。本番署名鍵は Google が保管。アップロード鍵は CI / 開発者が AAB 署名に使う。SHA-1/SHA-256 フィンガープリント（API 連携で必要）は Play Console の「アプリ署名」画面で確認できる。
>
> ⚠️ **Firebase / Google Maps / Google Sign-In などを使う場合**、Play App Signing の SHA-1 を Firebase / GCP コンソールに登録する。アップロード鍵の SHA-1 と本番署名鍵の SHA-1 は別物なので両方登録。

---

## 4. ストア掲載の枠（メイン情報）

Play Console → `Grow` → `ストア掲載情報` → `メインのストア掲載情報`。**言語ごとに別々に入れる**項目があるので、ローカライズ対象の各言語で記入する。

- [ ] **アプリ名**（30 文字）
- [ ] **簡単な説明（Short description）**（80 文字、ストアの最初に表示）
- [ ] **詳しい説明（Full description）**（4000 文字、本文）

> 💡 詳細は 03-release.md §1 で扱う（リリースごとに更新する内容のため）。ここでは最小限の枠だけ作っておく。

---

## 5. アプリのカテゴリと連絡先

Play Console → `Grow` → `ストアの設定`。

- [ ] **アプリ / ゲーム**の区分（再確認）
- [ ] **カテゴリ**を選択（アプリは 30+ カテゴリ、ゲームは 17 カテゴリ）
- [ ] **タグ**（最大 5 個、検索キーワード補助）
- [ ] **メール アドレス**（公開連絡先、必須）
- [ ] **電話番号**（任意、公開される）
- [ ] **ウェブサイト URL**（任意推奨、公開される）
- [ ] **外部マーケティング**（プロモーションへの掲載許可）

---

## 6. プライバシー ポリシー URL

Play Console → `ポリシー` → `アプリのコンテンツ` → `プライバシー ポリシー`。

- [ ] **Privacy Policy URL**（必須、HTTPS かつ常時アクセス可能）
- [ ] アプリ内からも Privacy Policy にリンクできるように UI 上で導線を確保（Setting 画面など）

> ⚠️ HTTPS かつ常時アクセス可能でないと審査で**必ず指摘される**。GitHub Pages / Notion 公開ページ / Google Sites は OK。仮ドメイン / 削除済み URL は NG。
>
> 💡 子ども向けアプリ / 学習アプリは Privacy Policy が事実上必須要件（Designed for Families 参加時）。

---

## 7. 配信国 / 価格

Play Console → `リリース` → `Production` → `Countries / regions` で初回設定（リリース提出時にも変更可）。

- [ ] **配信国**を選択（全世界 / 特定地域、最初は数カ国に絞ってもよい）
- [ ] 有料アプリの場合: **価格**を国ごとに設定（基準通貨を入れると自動換算）
- [ ] 中国本土を含めるか（ICP / Cyberspace Administration 要件あり、最初は外しておくのが安全）
- [ ] 韓国向けの追加要件（Game Rating Board）に該当するか確認

> 💡 **初回は無料 / 主要数カ国**から始めて、運用が安定してから広げるのが安全。国ごとの法令対応（KR の Game Rating Board、EU の DSA、CN の ICP など）はリリース後に追加可能。

---

## 8. Designed for Families（子ども向けアプリの場合のみ）

子ども向けアプリ（または Mixed Audience）はここで扱う。**該当しないなら丸ごとスキップ**。

- [ ] Play Console → `ポリシー` → `アプリのコンテンツ` → `ターゲット ユーザーと内容`
- [ ] 対象年齢層を選択（5 歳以下 / 6-8 / 9-12 / 13-15 / 16-17 / 18+）
- [ ] **子ども向け**または**Mixed Audience**の場合、Families ポリシーに準拠するか確認
- [ ] [Designed for Families](https://play.google.com/console/about/families/) プログラムへの参加可否を判断
- [ ] COPPA / GDPR-K 対応（米国 13 歳未満、EU 16 歳未満の同意取得）

> ⚠️ 子ども向けアプリは **広告ネットワークが Families ポリシー準拠**である必要（AdMob は子ども向け設定で OK）。**ATT 相当のトラッキング許可は取らない**。
>
> ⚠️ 13 歳未満ユーザーには SSO（Google Sign-In / Sign in with Apple）の利用方法に制限あり。

---

## ノート / ブロッカー（自由記入）

> 命名根拠 / カテゴリ選択の理由など、初期設定時の意思決定を残しておくと、後にチーム拡大したときに参照できる。

(まだ何も記録なし)
