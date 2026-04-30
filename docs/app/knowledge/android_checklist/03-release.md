# 03. リリース提出フロー（毎リリース）

各バージョン（1.0, 1.1, 1.2 ...）を Google Play に出すたびに使うチェックリスト。アップロード〜審査提出〜リリースまで全部入り。

> 進捗管理ルールは [`README.md`](README.md) を参照。
> Reject / Policy 違反になったら [`99-troubleshooting.md`](99-troubleshooting.md) へ。

---

## 進捗サマリ（AI 自動更新）

- **対象アプリ**: TBD
- **Version Name**: TBD（例: 1.0.0）
- **Version Code**: TBD（整数、単調増加）
- **Target SDK**: TBD（最新ルールに準拠）
- **現フェーズ**: 未開始
- **完了**: 0 / 65
- **直近のブロッカー**: なし
- **最終更新**: -

---

## 全体フロー

```
[ストアページ更新]   ← アイコン / フィーチャーグラフィック / スクショ / 説明文
        │
        ▼
[アプリのコンテンツ全申告]   ← Data Safety / Content Rating / Target audience / Ads / Permissions
        │
        ▼
[Android Studio 事前確認]   ← Target SDK / Version code / 署名 / 権限 / Proguard
        │
        ▼
[AAB ビルド & アップロード（Internal Testing 推奨）]
        │
        ▼
[Pre-launch report 自動実行 / 警告確認]
        │
        ▼
[(必要なら) Closed / Open テスト経由（個人新規アカウントは 14 日間 必須）]
        │
        ▼
[Production リリースに昇格 → 提出]
        │
        ▼
[審査（数時間〜7 日）→ Approved / Rejected]
        │
        ▼ (承認後)
[Staged rollout で 1% → 5% → 20% → 50% → 100%]
        │
        ▼
[リリース後の確認 / Vitals / クラッシュ監視]
```

---

## 1. ストアページ（アイコン・スクショ・テキスト）

Play Console → `Grow` → `ストア掲載情報` → `メインのストア掲載情報`。

### 1.1. グラフィックアセット

- [ ] **アプリアイコン**: **512 × 512 PNG**（32-bit、1MB 以下、角丸なし、透過なし）
- [ ] **フィーチャー グラフィック**: **1024 × 500 JPG/PNG**（必須、ストア検索結果や Editor's Choice で使用）
- [ ] アプリ内アイコン（mipmap-mdpi 〜 mipmap-xxxhdpi）を各密度で書き出し
- [ ] **Adaptive Icon**（API 26+）に対応（背景レイヤー + 前景レイヤー、各 108×108dp）
- [ ] マスター画像とストアアイコンの**デザインを完全一致**させる（不一致は警告対象）

### 1.2. スクリーンショット

| デバイス | 推奨解像度 | 必須/任意 | 枚数 |
| --- | --- | --- | --- |
| Phone | 1080 × 1920 〜 1440 × 2560（16:9 〜 9:18.5） | **必須** | 2-8 枚 |
| 7インチ Tablet | 1024 × 600 〜 7インチ向け | タブレット対応なら推奨 | 1-8 枚 |
| 10インチ Tablet | 1280 × 800 〜 10インチ向け | タブレット対応なら推奨 | 1-8 枚 |
| Wear OS | 384 × 384 | Wear 対応なら必須 | 1-8 枚 |
| TV（Banner / Screenshot） | 1280 × 720 | TV 対応なら必須 | 1-8 枚 |
| Chromebook（任意） | 1080 × 1920 〜 | 任意 | - |

- [ ] Phone スクリーンショットを **2-8 枚**用意（最初の数枚が検索結果プレビューで表示）
- [ ] **JPG または 24bit PNG**（透過 / 角丸はストア側で処理されるので元は四角でよい）
- [ ] アスペクト比 **16:9 〜 9:18.5** の範囲内
- [ ] (任意) **プロモーション動画**（YouTube URL、最大 30 秒、横向き推奨）

### 1.3. テキスト（言語ごと）

- [ ] **アプリ名**（30 文字）
- [ ] **簡単な説明（Short description）**（80 文字、ストア最上部に表示）
- [ ] **詳しい説明（Full description）**（4000 文字、本文）
- [ ] **What's new（リリースノート）**（500 文字、各リリースで更新）

> ⚠️ **ASO（App Store Optimization）的に最も効くのは Short description と Full description の最初の 167 文字**。検索キーワードを自然に含める。**過剰なキーワード羅列は Spam 扱いで Reject** される（Policy 4.6）。

### 1.4. ローカライズ

- [ ] 対応言語ごとに、Short / Full description / What's new / アプリ名を翻訳
- [ ] スクリーンショット内の文字も該当言語にローカライズ（推奨）
- [ ] アプリ内ローカライズと一致しているか確認

---

## 2. アプリのコンテンツ申告（最重要）

Play Console → `ポリシー` → `アプリのコンテンツ`。**全項目をクリアしないと公開できない**。近年 Reject の最大要因。

### 2.1. Privacy Policy

- [ ] Privacy Policy URL が設定済み（02-new-app.md §6 で済んでいる前提）
- [ ] Privacy Policy 内容が**現リリースの実装と整合**している（SDK 追加 / 削除があった場合は更新）

### 2.2. Ads（広告の有無）

- [ ] 広告を表示するかどうかを申告（YES / NO）
- [ ] YES の場合、**簡単な説明** / **詳しい説明** で「広告あり」を明記（推奨）

### 2.3. App access（テスト用認証情報）

- [ ] **すべての機能が無料 / 認証なしで使える**: 「特別なアクセスは不要」を選択
- [ ] サインインが必要な機能がある場合: **テストアカウント**を提供（必須、確実に動く ID/PW + 任意の手順説明）

### 2.4. Content Rating（IARC アンケート）

Play Console → `アプリのコンテンツ` → `コンテンツのレーティング`。

- [ ] IARC アンケートに回答（暴力 / 性的表現 / 言葉遣い / 賭博 / 薬物 / 恐怖 / ユーザー作成コンテンツなど）
- [ ] 算出されたレーティング（Everyone / Teen / Mature 17+ / Adults Only 18+）を確認
- [ ] **同じ内容のアプリでも回答内容で Reject される**ことがあるので、慎重に答える（実装と一致させる）

> ⚠️ 「ユーザー間メッセージ機能」「位置情報共有」「ユーザー作成コンテンツ」のいずれかに YES とすると、追加のモデレーション要件が発生（通報機能の実装、ユーザーブロック機能など）。

### 2.5. Target audience and content（ターゲット ユーザー）

- [ ] 対象年齢層を選択
- [ ] **子ども向け / Mixed Audience** の場合、Families ポリシーへの準拠を再確認
- [ ] 子ども向けの場合、**広告ネットワークが Families ポリシー準拠**であること（AdMob は「子ども向けの取り扱い」を ON）

### 2.6. News apps（ニュースアプリの場合）

- [ ] ニュースアプリかどうか申告（メディア / 報道機関の場合）

### 2.7. COVID-19 contact tracing（該当する場合）

- [ ] 該当アプリかどうか申告（一般的な健康アプリは NO）

### 2.8. Data Safety（データセーフティ）

iOS の App Privacy 相当。**収集データの種類と用途**を申告する。Play Console → `アプリのコンテンツ` → `データ セーフティ`。

- [ ] データを **収集 / 共有しない** と申告する場合: 本当にゼロか再確認（解析 SDK が入っていないか）
- [ ] 収集する場合、**データタイプ × 用途 × 必須/任意 × 暗号化 × 削除リクエスト可否**のマトリクスを記入
- [ ] **第三者 SDK（Firebase / GA / AdMob / Sentry など）の収集も自分のアプリの収集として申告**
- [ ] Privacy Policy URL の内容と Data Safety の申告が**一致**しているか確認
- [ ] **送信中の暗号化**（HTTPS）を使っているか申告
- [ ] **ユーザーがデータ削除を要求できる仕組み**があるか申告
- [ ] **Independent security review** を受けているか（任意、受けていれば申告）

> ⚠️ Data Safety の申告と実際の通信内容が**一致しない場合、Pre-launch report で警告が出る**ことがある。AdMob / Firebase の SDK 構成変更時は必ず再確認。
>
> 💡 [SDK Index](https://play.google.com/sdks) で、よく使う SDK のデータ収集情報を Google が公開しているので、自前で調べるより速い。

### 2.9. Government apps

- [ ] 政府機関 / 公的機関のアプリかどうか申告

### 2.10. Financial features

- [ ] 金融機能（ローン / 暗号通貨 / 投資など）を含むかどうか申告

### 2.11. Health（ヘルス機能）

- [ ] 健康情報の収集 / 表示があるかどうか申告（Health Connect 連携時など）

### 2.12. Permissions declaration（機密権限）

下記を使う場合、**Permissions Declaration Form** の提出が必要:

- [ ] **All files access**（`MANAGE_EXTERNAL_STORAGE`）— ファイラー / バックアップ系のみ許可、SAF を使えるならそれを使う
- [ ] **SMS / Call Log**（`READ_SMS` `RECEIVE_SMS` `READ_CALL_LOG` `WRITE_CALL_LOG`）— 既定 SMS アプリ等限定
- [ ] **Background Location**（`ACCESS_BACKGROUND_LOCATION`）— バックグラウンドで位置情報が必要な明確な機能を提示
- [ ] **Accessibility Service**（`BIND_ACCESSIBILITY_SERVICE`）— 障害支援以外の用途は厳しく審査
- [ ] **Foreground Service permissions**（`FOREGROUND_SERVICE_*`、API 34+）— 用途別の権限を `AndroidManifest.xml` で正しく宣言
- [ ] **Exact alarm**（`SCHEDULE_EXACT_ALARM`、API 31+）— カレンダー / アラーム系限定
- [ ] **Full screen intent**（`USE_FULL_SCREEN_INTENT`、API 34+）— 着信 / アラームのみ許可

> ⚠️ 不要な機密権限を入れていると `90 日以内に削除しないと公開停止` の通知が来る。`AndroidManifest.xml` を grep して使っていない `<uses-permission>` を削除する習慣を。

---

## 3. ビルド作成とアップロード

### 3.1. Android Studio / build.gradle 側の事前確認

- [ ] **versionName**（マーケティングバージョン、例: `1.2.0`）を設定
- [ ] **versionCode**（整数のビルド番号）を**単調増加**させる（過去と同じ番号は再アップロード不可）
- [ ] **compileSdk** / **targetSdk** が [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878) に準拠しているか
  > Target SDK は毎年 8 月末に「最新 -1」が要求される。2026 年は API 35（Android 15）が最低ライン
- [ ] **minSdk** が事業要件と合っているか（広告 SDK は minSdk 21+ 推奨）
- [ ] Build Variant: **release**
- [ ] Code Signing が正しく動いている（Play App Signing 用のアップロード鍵）
- [ ] `AndroidManifest.xml` の権限（`<uses-permission>`）が必要最小限
- [ ] `<uses-feature>` で必須ハードウェア / 任意ハードウェアを正しく指定（タブレットでカメラ無しデバイスを除外しない設定など）
- [ ] **Proguard / R8** が有効（`isMinifyEnabled = true`、`isShrinkResources = true`）
- [ ] Debug 用コード（`Log.d` / デバッグメニュー / テストアカウントの自動入力）が Release ビルドで除去
- [ ] `BuildConfig.DEBUG` を使った条件分岐が正しく動作
- [ ] **Network Security Config** で平文 HTTP を許可していないか確認（特定ホストだけ許可するなら明記）
- [ ] **mapping.txt**（R8 のシンボルマップ）を生成（クラッシュ解析用）

### 3.2. AAB ビルドとアップロード

- [ ] Android Studio: `Build → Generate Signed App Bundle / APK → Android App Bundle`
- [ ] CLI: `./gradlew bundleRelease` → `app/build/outputs/bundle/release/app-release.aab`
- [ ] **アップロード鍵で署名**（Play App Signing が本番鍵を生成）
- [ ] AAB を Play Console → `テスト` → `Internal testing` → 新しいリリースを作成 → アップロード
- [ ] **Native Debug Symbols（.zip）**をアップロード（NDK / native code 利用時、クラッシュレポートのシンボリケーション用）
- [ ] **mapping.txt（R8）** をアップロード（自動取り込みされる場合もあるが手動でも可）
- [ ] CLI なら `gradle-play-publisher` / `fastlane supply` / GitHub Actions の [r0adkll/upload-google-play](https://github.com/r0adkll/upload-google-play) などで自動化可能

### 3.3. Pre-launch report（自動クラッシュ検査）

AAB アップロード後、**Firebase Test Lab で自動的にクラッシュ / セキュリティ / アクセシビリティ検査**が走る（Internal でも実行される）。

- [ ] Pre-launch report の **Stability** タブ: クラッシュ / ANR をすべて確認
- [ ] **Security & trust** タブ: SSL 検証回避 / 平文通信 / 危険な権限などの警告を確認
- [ ] **Accessibility** タブ: タップ領域不足 / コントラスト不足の指摘を確認（必須ではないが推奨）
- [ ] **Performance** タブ: 起動時間 / メモリ / フレーム落ちを確認
- [ ] **Screenshots** タブ: 各 Pixel デバイスでの実機キャプチャを確認（ローカライズ崩れ / レイアウト崩れの早期発見に有効）

> 💡 Pre-launch report は **デフォルトで 5 分程度のロボットテスト**。ログイン画面で止まる場合は Play Console → `テスト` → `Pre-launch report` → `Settings` でテストアカウントを設定可能。

---

## 4. テストトラック（Internal / Closed / Open）

iOS の TestFlight に相当。本番審査の前に身内 / ベータユーザーに配って動作確認するフェーズ。

### 4.1. Internal Testing（最大 100 人、即配信）

- [ ] AAB を Internal Testing にアップロード（§3.2 で完了している前提）
- [ ] **テスター リスト**を作成（最大 100 人、メールアドレス指定 or Google グループ）
- [ ] テスト用 URL（`https://play.google.com/apps/internaltest/...`）をテスターに共有
- [ ] テスターが **Play ストアで「テスターになる」リンクを開いて参加**
- [ ] 数分〜数時間で配信（審査なし）

### 4.2. Closed Testing（招待 / 国別、ベータ審査あり）

- [ ] Closed Testing にビルドを昇格 or 新規アップロード
- [ ] テスターを **メール（最大 5,000 人）** または **Google グループ** で招待
- [ ] **20 名以上で 14 日間以上のクローズドテスト** を実施（**個人アカウントの新規アプリは Production 公開前に必須**、2023 年 11 月以降）
- [ ] 14 日経過後、Play Console から **Production への昇格申請**ボタンを押せる

> ⚠️ **2023 年 11 月以降に作成された個人アカウントは、本番リリース前に 20 人 / 14 日のクローズドテストが必須**。条件を満たさないと Production 申請ボタンがグレーアウト。組織アカウントは対象外。

### 4.3. Open Testing（公開ベータ）

- [ ] Open Testing にビルドを昇格 or 新規アップロード
- [ ] **国 / 地域**を選択
- [ ] テスト URL を公開（誰でも参加可能）
- [ ] Play ストア検索結果に「（早期アクセス）」として表示される

---

## 5. Production 提出

Play Console → `リリース` → `Production` → 「新しいリリースを作成」。

- [ ] **AAB を選択**（テスト済みのビルドを Internal/Closed/Open から昇格 or 新規アップロード）
- [ ] **リリース名**（内部管理用、例: `1.2.0 (45)`）
- [ ] **What's new（リリースノート）**を言語ごとに記入（500 文字 / 言語）
- [ ] **配信国**を最終確認
- [ ] **Staged rollout（段階的公開）**の比率を設定（推奨: **1% から開始**）
- [ ] **Save** → **Review release** → エラー / 警告がなければ **Start rollout to Production**
- [ ] 提出後、`In review` → `Approved` で配信開始（数時間〜7 日）

> ⚠️ **新規アプリ（1.0）と機密権限を含むアプリは審査が長い**（最大 7 日）。Sensitive Permissions の Declaration が不完全だと審査が止まる。
>
> 💡 **Staged rollout は途中で停止 / 比率変更が可能**。クラッシュが急増したら **Halt rollout** で配信停止 → 修正版を出す。

---

## 6. リリース後の確認

- [ ] Play ストアでアプリページが表示されるか確認（反映に最大 24 時間）
- [ ] 実機で Play ストアからダウンロードして起動確認
- [ ] **Staged rollout 中は毎日 Vitals を確認**、重大なクラッシュ / ANR が出たら **Halt** or **緊急アップデート**
- [ ] Play Console → `Quality` → `Android vitals` で **Crash rate / ANR rate / 起動時間 / バッテリー / Wakeup** を確認
  > 「Bad behavior threshold」を超えるとストア順位が下がる
- [ ] **Statistics** で DAU / インストール / アンインストール / コンバージョン率を確認
- [ ] **Reviews** を監視、低評価レビューには返信機能で対応
- [ ] 問題発生時は **Halt rollout** で公開停止 → 修正版を AAB アップロード → 新リリース作成
- [ ] **mapping.txt（R8）** が正しく取り込まれてクラッシュレポートがシンボリケーションされているか確認

---

## 7. リリース後の運用ポイント

- [ ] **Target SDK の年次更新**（毎年 8 月末までに最新 API レベル -1 へ）
- [ ] **権限の継続見直し**（不要な権限を削除しないと公開停止リスク）
- [ ] **SDK 脆弱性通知**（Play Console → メッセージで届く、対応期限が決まっている）
- [ ] **政策変更通知**（Play Console → ポリシー → ポリシー センターで履歴確認）
- [ ] **Play Integrity API** への移行（旧 SafetyNet Attestation は 2025 年に廃止予定、新規アプリは Play Integrity 必須）

---

## ノート / ブロッカー（自由記入）

> リリースごとに記録する作業ログ。次回リリース時に同じ罠を踏まないよう、ハマったところは詳しめに残す。

(まだ何も記録なし)
