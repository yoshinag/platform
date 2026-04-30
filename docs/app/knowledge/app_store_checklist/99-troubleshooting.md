# 99. トラブルシューティング（Reject 対応・ITMS エラー）

審査で Reject されたとき / アップロードが失敗したとき / ステータスが進まないときに見るリファレンス。**進捗チェックリストではなくリファレンス**として使う（チェックボックスは Reject 対応のフロー部分のみ）。

> 進捗管理ルールは [`README.md`](README.md) を参照。

---

## 1. 審査ステータスの遷移

```
[Prepare for Submission]   ← 入力中
        │
        ▼
[Waiting for Review]   ← 提出済み(通常 24h 以内に進む)
        │
        ▼
[In Review]   ← 審査中(数時間〜1 日)
        │
        ├──→ [Pending Developer Release]   ← 承認、手動リリース待ち
        │           │
        │           ▼
        │    [Ready for Sale]   ← 配信中
        │
        └──→ [Rejected]   ← 拒否、Resolution Center で対応
```

### 各ステータスで止まったときの対処

| 止まる場所 | 通常の所要時間 | 24h 以上経っても進まない場合 |
| --- | --- | --- |
| Waiting for Review | 24h 以内 | サポートに連絡（[Contact Us](https://developer.apple.com/contact/)）|
| In Review | 数時間〜1 日 | 通常の範囲。長くて 3 日待つことも |
| Pending Developer Release | ユーザー操作待ち | 自分でリリースボタンを押す |
| Processing（ビルド処理） | 5〜30 分 | エラーメール確認、§2 の ITMS 対応へ |

---

## 2. ITMS エラー対応表

ビルドアップロード後にメールで来るエラーコードと対応。

| コード | 内容 | 対応 |
| --- | --- | --- |
| ITMS-91053 | 必須 Reason API 未宣言 | `PrivacyInfo.xcprivacy` の `NSPrivacyAccessedAPITypes` に該当 API と Reason を追記 |
| ITMS-90683 | Usage Description 不足 | `Info.plist` に該当する `Ns*UsageDescription` を追加 |
| ITMS-90338 | dSYM 不足 | アップロード時に「Include app symbols」をチェック、または dSYM を Organizer から手動アップロード |
| ITMS-90809 | 非推奨 API（UIWebView 等）使用 | WKWebView などへ置き換え |
| ITMS-90078 | プロビジョニング不一致 | Bundle ID / Team / Profile を再確認、Xcode の自動管理を試す |
| ITMS-90165 | コードサイン無効 | Distribution Certificate の有効期限・正しい鍵で署名されているか確認 |
| ITMS-90562 | Info.plist のビルド番号不正 | `CFBundleVersion` を単調増加させる |
| ITMS-90713 | Privacy Manifest 不在 | サードパーティ SDK 含めて Privacy Manifest を含むバージョンに更新 |

> 💡 **エラーメールは保存しておく**: 同じエラーを繰り返すと根本原因が掴めなくなる。日付付きで残して傾向を見るとデバッグが速い。

---

## 3. よく Reject される Guideline 別パターン

| Guideline | 典型例 | 対策 |
| --- | --- | --- |
| 2.1 App Completeness | クラッシュ / プレースホルダーテキスト / 機能不全 | 実機で全機能を一通り動かしてから提出 |
| 2.3.1 Hidden Features | 未公開機能 / プライベート API 使用 | 公開 API のみ使用 |
| 2.3.3 Accurate Metadata | スクショと実機の見た目が違う | 実機キャプチャを使う、誇張表現を避ける |
| 2.5.1 Software Requirements | 非公開 API / メソッドスウィズリング濫用 | 同上 |
| 3.1.1 In-App Purchase | デジタルコンテンツの外部決済誘導 | StoreKit / IAP に統一（実物商品は除く） |
| 4.0 Design | UI が壊れている / iOS らしくない / 不自然 | HIG 準拠、複数デバイス / Dynamic Type で検証 |
| 4.2 Minimum Functionality | 機能が薄い / Web ラッパーのみ | ネイティブ機能を組み込む |
| 4.3 Spam | 既存アプリの薄いコピー / 重複出品 | 独自性を確保 |
| 4.8 Sign in with Apple | サードパーティログイン提供時に Apple 認証なし | Sign in with Apple も提供 |
| 5.1.1 Privacy - Data Collection | 不要な権限 / Usage Description 不足 / 説明文が抽象的 | 最小権限、具体的な利用目的を明記 |
| 5.1.2 Privacy - Data Use and Sharing | Privacy Policy と App Privacy が不一致 | 申告内容と Privacy Policy を整合 |
| 5.1.3 Health and Health Research | 医療系の根拠不足 | 医療従事者監修 / エビデンス提示 |
| 5.2.1 Intellectual Property | 商標 / キャラ無断使用 | 権利確認、ライセンス取得 |

---

## 4. Rejected されたときの対応フロー

> このセクションのチェックは Reject 1 回ぶんで使う。次の Reject ではまた `[ ]` に戻して使い直す（または日付付き note で履歴を残す）。

- [ ] **Resolution Center** で具体的な指摘内容と Guideline 番号を確認
- [ ] 指摘内容を読んで対応方針を判断
  - [ ] 解釈の問題 → **Reply** で反論 / 質問（バイナリ再アップ不要）
  - [ ] コード修正が必要 → 修正版をアップロードして再提出
  - [ ] 解釈に強い異議あり → **App Review Board** にアピール（同じレベル・別審査官の判断を仰ぐ）
- [ ] 修正の場合: 修正は**指摘範囲だけ**に絞る（範囲外を弄ると別の Reject 理由を生む）
- [ ] 再提出時: **Notes** に「指摘 X に対する修正点: ...」と簡潔に記入
- [ ] 繰り返し落ちる場合: **Apple Developer Forums** や **Code-Level Support** 相談を検討

> 💡 **心構え**: 初回はほぼ何かしら指摘される。短文で礼儀正しく Reply、長文は逆効果。返答待ちは新規申請より早く 24h 以内が多い。

### Reject 履歴ログ（自由記入）

> 何回目の Reject で何を指摘されたか、どう対応したかを残しておくと、次回以降の予防になる。

(まだ何も記録なし)

---

## 5. 緊急時: Expedited Review

リリース済みアプリで重大な不具合が発生したとき、審査の優先処理をリクエストできる。

- 申請窓口: [Contact Us → Request an Expedited App Review](https://developer.apple.com/contact/app/)
- 通る条件: ユーザーへの実害がある（クラッシュ、データ消失、決済不具合など）
- 単なる「リリース予定に間に合わない」では通らない

> ⚠️ Expedited Review は乱発禁止。同じアカウントで何度も使うと通らなくなる。本当に必要なときだけ。

---

## 6. その他のハマりどころ

### バージョン番号 / ビルド番号
- `CFBundleVersion`（ビルド番号）は**単調増加**必須。同じ値での再アップロード不可
- `CFBundleShortVersionString`（マーケティングバージョン）は重複可、同じ値で再申請しても OK

### Privacy Policy URL
- HTTPS かつ常時アクセス可能でないと審査で必ず指摘される
- 削除済み URL や仮のドメインを指していると Reject

### Demo Account
- サインインが必要なアプリで Demo Account 未提供 → **即 Reject**（Guideline 2.1）
- 提供したアカウントが動かない → 即 Reject
- 申請前に必ず実機で Demo Account でログインできることを確認

### Sign in with Apple 必須条件（Guideline 4.8）
- 第三者の SNS ログイン（Google / Facebook / Twitter / LINE など）を提供している場合、Apple 認証も提供必須
- 例外: ビジネス系アプリで企業アカウントのみ、教育系アプリで学校配布アカウントのみ、など

### Universal vs iPhone-Only
- iPad 対応するなら全機能対応必須（一部機能のみ iPad 不可は Reject 対象）
- iPhone Only の指定は OK（iPad ユーザーには iPhone 互換モードで動く）
