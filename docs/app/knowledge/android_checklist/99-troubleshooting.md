# 99. トラブルシューティング（Reject 対応・Policy 違反・公開停止）

審査で Reject されたとき / アップロードが失敗したとき / Policy 違反通知が来たとき / アプリが公開停止されたときに見るリファレンス。**進捗チェックリストではなくリファレンス**として使う（チェックボックスは Reject 対応のフロー部分のみ）。

> 進捗管理ルールは [`README.md`](README.md) を参照。

---

## 1. 審査ステータスの遷移

```
[Draft]   ← 入力中
        │
        ▼
[In review]   ← 提出済み(数時間〜7 日)
        │
        ├──→ [Available on Google Play]   ← 承認、配信中
        │           │
        │           ▼
        │    [Staged rollout 進行中]   ← 1% → 5% → 20% → 50% → 100%
        │
        └──→ [Rejected]   ← 拒否、ポリシー センターで対応
                    │
                    ▼
        [App suspended / Removed]   ← ポリシー違反で停止
```

### 各ステータスで止まったときの対処

| 止まる場所 | 通常の所要時間 | 7 日以上経っても進まない場合 |
| --- | --- | --- |
| In review（新規 1.0） | 数時間〜7 日 | Play Console → ヘルプ → お問い合わせ |
| In review（更新） | 数時間〜数日 | 機密権限 / 大規模変更があると長くなる |
| Pre-launch report | 数分〜数十分 | 失敗時は「すべてのテストを再実行」、Test Lab 側の問題なら数時間後再試行 |
| Staged rollout 一時停止 | ユーザー操作待ち | 自分で再開 / 比率変更 |

---

## 2. ビルドアップロード時のよくあるエラー

| エラー | 内容 | 対応 |
| --- | --- | --- |
| `Version code already used` | versionCode が過去と同じ | versionCode を単調増加させる（過去の最大値 +1） |
| `APK signature does not match` | アップロード鍵が違う | 正しいアップロード鍵で再署名（紛失時は Play サポートに鍵交代申請） |
| `Target SDK is too low` | targetSdk が要件未満 | [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878) に従って targetSdk を更新 |
| `Debuggable=true is not allowed` | release ビルドが debuggable | `<application android:debuggable="false">` または release ビルドで build.gradle の debuggable を外す |
| `Translation missing for default language` | デフォルト言語の翻訳が不足 | デフォルト言語の strings.xml を確認 |
| `Native code uses 32-bit only` | 64-bit native ライブラリ不足 | abiFilters に `arm64-v8a` を追加して再ビルド（2019 年 8 月以降必須） |
| `App Bundle exceeds size limit` | AAB が大きすぎる | Play Asset Delivery / Dynamic Feature Module で分割 |
| `Required Permissions Declaration missing` | 機密権限が宣言されていない | Play Console → ポリシー → アプリのコンテンツ → 該当権限のフォームを提出 |

> 💡 **アップロード前に `bundletool` で AAB の中身を検証**できる。`bundletool validate --bundle=app-release.aab` で必須項目の欠落を事前検出。

---

## 3. よく Reject される Policy 違反パターン

[Developer Program Policies](https://play.google.com/about/developer-content-policy/) のうち、特にハマるもの。

| Policy | 典型例 | 対策 |
| --- | --- | --- |
| Misleading Claims | スクリーンショットと実機の挙動が違う / 機能の誇張 | 実機キャプチャを使う、誇張表現を避ける |
| Spam and Minimum Functionality | 機能が薄い / Web ラッパーのみ / コピーアプリ | ネイティブ機能を組み込む、独自性を確保 |
| User Data | Privacy Policy と Data Safety が不一致 | 申告内容と Privacy Policy を整合 |
| Permissions and APIs that Access Sensitive Information | 不要な機密権限 / Declaration なし | 最小権限 + Permissions Declaration Form 提出 |
| Background Location | バックグラウンド位置情報を必須にしている | 機能の根幹でなければフォアグラウンドのみに変更 |
| Families Policy | 子ども向けで不適切広告 / 第三者 SDK | AdMob を子ども向け設定、Families ポリシー準拠 SDK のみ使用 |
| Financial Services | 個人ローン APR 表示なし / 暗号通貨マイニング | APR 等の必須情報を本文に明記、マイニングは禁止 |
| Health Misinformation | 医療系の根拠不足 | 医療従事者監修 / エビデンス提示 |
| Intellectual Property | 商標 / キャラ無断使用 | 権利確認、ライセンス取得 |
| Impersonation | 他社アプリ名 / アイコン / ブランドの模倣 | オリジナルのデザイン / ネーミング |
| Ads | インタースティシャルがコンテンツを覆う / 閉じるボタンが押せない | Ad UX ガイドラインに従って実装、AdMob のテストモードで検証 |
| Subscriptions | 価格 / 自動更新の明示なし | 購入画面で「年額 X 円、自動更新」と明示、いつでも解約可能と表記 |
| Hate Speech / Violence | UGC のモデレーション不足 | 通報機能、ブロック機能、利用規約に違反コンテンツ禁止を明記 |

---

## 4. Rejected されたときの対応フロー

> このセクションのチェックは Reject 1 回ぶんで使う。次の Reject ではまた `[ ]` に戻して使い直す（または日付付き note で履歴を残す）。

- [ ] **Play Console → ポリシー → アプリのコンテンツ** または **メール通知** で Policy 番号と具体的な指摘内容を確認
- [ ] 指摘内容を読んで対応方針を判断
  - [ ] 解釈の問題 → **アピール（Appeal）** で反論 / 説明（バイナリ再アップ不要）
  - [ ] コード修正が必要 → 修正版 AAB をアップロードして再提出
  - [ ] 解釈に強い異議あり → **Policy Support** にエスカレーション（1 回目のアピール棄却後）
- [ ] 修正の場合: 修正は**指摘範囲だけ**に絞る（範囲外を弄ると別の Reject 理由を生む）
- [ ] 再提出時: **What's new** または **Notes**（Internal）に「指摘 X に対する修正点: ...」と簡潔に記入
- [ ] 繰り返し落ちる場合: **Play Console → ヘルプ → お問い合わせ** で個別相談

> 💡 **心構え**: 個人アカウントの新規アプリは初回ほぼ何かしら指摘される。短文で礼儀正しくアピール。長文 / 感情的な反論は逆効果。返答待ちは 24-72h が多い。
>
> ⚠️ **3 回続けて同じ理由で Reject されると、アカウント警告 → 公開停止 → 終了の段階に進む**。3 回目までに必ず根本対応すること。

### Reject 履歴ログ（自由記入）

> 何回目の Reject で何を指摘されたか、どう対応したかを残しておくと、次回以降の予防になる。

(まだ何も記録なし)

---

## 5. アカウント停止 / アプリ公開停止

最悪のケース。Play Console にログインしたら大きな赤バナーが出ている。

### 5.1. アプリ単独の公開停止（Suspended / Removed）

- 原因: ポリシー違反、権限不正使用、ユーザー苦情の集中、知的財産権侵害申し立て、など
- 対応:
  - **30 日以内にアピール**（Play Console → ポリシー → ポリシーセンター → アピール）
  - 違反箇所を**修正した AAB を準備**してアピールに添付
  - アピール棄却後の再アピールは難しい。慎重に書く

### 5.2. 開発者アカウントの停止（Account Termination）

- 原因: 重大ポリシー違反（マルウェア / フィッシング）、複数アプリの累積違反、虚偽の本人確認情報、など
- 対応:
  - **アカウント単位の停止は復活率が極めて低い**
  - 別アカウントで再登録は禁止（規約違反）、検出されると新アカウントも停止
  - **アピールは 1 回のみ**、本気で書く（具体的に何が違反だったかを認識し、再発防止策を明示）
  - ビジネス継続を考えるなら、サブブランド用に**別法人 / 別 D-U-N-S**で取り直すのが現実的（虚偽はダメ、別実体である必要）

> ⚠️ **アカウント停止は事前警告メールが来ていることが多い**（90 日 / 30 日 / 7 日の段階通知）。Play Console → メッセージを毎日確認する習慣を。

---

## 6. 緊急時: 公開停止と修正版の緊急アップデート

リリース済みアプリで重大な不具合（クラッシュ / セキュリティ / 決済不具合）が発生したとき。

- [ ] **Halt rollout**（Staged rollout の停止、Production → リリース管理 → 「公開を停止」ボタン）
  > 既にインストールしたユーザーには影響しないが、新規インストールが止まる
- [ ] 修正版 AAB を versionCode を上げて作成
- [ ] **Internal testing で短時間検証**（30 分〜数時間）
- [ ] Production に新リリースを作成して提出（**通常より早く審査される**ケースが多いが保証はない）
- [ ] 緊急で審査を早めたい場合: Play Console → ヘルプ → お問い合わせで「Critical issue」を伝える

> ⚠️ Apple の Expedited Review のような明示的な「緊急審査」窓口は無い。お問い合わせから個別交渉。乱発禁止。

---

## 7. その他のハマりどころ

### バージョン番号 / Version Code

- `versionCode`（整数）は**単調増加**必須。同じ値での再アップロード不可
- `versionName`（文字列）は重複可、同じ値で再申請しても OK
- ABI 別に APK を分けている場合、各 ABI の versionCode は別管理（推奨は基底 + ABI オフセット）

### Privacy Policy URL

- HTTPS かつ常時アクセス可能でないと審査で**必ず指摘される**
- 削除済み URL や仮のドメインを指していると Reject
- アプリ内からも Privacy Policy にリンクできるようにする（Settings 画面など）

### テストアカウント（App access）

- サインインが必要なアプリでテストアカウント未提供 → **即 Reject**
- 提供したアカウントが動かない → 即 Reject
- 申請前に必ず実機でテストアカウントでログインできることを確認

### Target SDK の年次更新

- 毎年 8 月末に「最新 -1」が要求される（2026 年は API 35 / Android 15 が最低）
- 期限超過: **新規 / 更新 AAB のアップロード不可**になる
- 既存の公開バージョンは配信継続するが、機能 / 端末ごとの非推奨警告が出る

### Play App Signing 用アップロード鍵を紛失したら

- Play Console → アプリ署名 → 「アップロード鍵をリセット」リクエスト
- Google が鍵交代を承認するまで 24-48h
- 紛失中は新規アップロード不可（既存ビルドの配信は継続）

### Permissions Declaration が無視され続けたら

- Play Console → ポリシー → アプリのコンテンツ → 該当権限の「機密権限の宣言」フォーム再送
- 同じフォームを複数回送るのは NG（評価期間中は待つ）
- 機能を**フォアグラウンド限定にする / SAF に切り替える**などで権限自体を不要にする回避策が一番速いことも

### Pre-launch report で常に同じ画面で止まる

- ログイン画面 / 同意画面で Robot がブロックされている可能性
- Play Console → テスト → Pre-launch report → Settings で **テストアカウント / ログイン手順** を設定
- 同意画面のチェックボックスを「初期 ON」にする / 「テストモード」のフラグを差し込む

### Native crash のシンボリケーションが効かない

- AAB アップロード時に **Native Debug Symbols（.zip）** をアップロードしているか確認
- `./gradlew bundleRelease` のオプションで symbolic info を含む設定: `android.bundle.enableUncompressedNativeLibs = true`
- 手動アップロードは Play Console → アプリの整合性 → デバッグ シンボル

### 子ども向けアプリで AdMob が表示されない

- AdMob の「子ども向けの取り扱い」設定を ON
- Tag for child-directed treatment（COPPA）を SDK 初期化時に設定: `RequestConfiguration.Builder().setTagForChildDirectedTreatment(...)`
- Families ポリシー準拠の広告ネットワークのみ使用（AdMob は OK、一部メディエーションネットワークは NG）
