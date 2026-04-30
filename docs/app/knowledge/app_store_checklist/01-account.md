# 01. アカウント・契約・共通鍵類のセットアップ（一度きり）

Apple Developer アカウントを新規に作るときの一度きりのセットアップ。一度終わったらこのファイルは触らなくて OK。**個人 / 法人 / Enterprise** の選択は最初に決める（あとから変更すると面倒）。

> 進捗管理ルールは [`README.md`](README.md) を参照。

---

## 進捗サマリ（AI 自動更新）

- **チームタイプ**: TBD（個人 / 組織 / Enterprise）
- **Team ID**: TBD
- **完了**: 0 / 12
- **直近のブロッカー**: なし
- **最終更新**: -

---

## 1. Apple ID と Developer Program

- [ ] Apple ID を作成し、**二要素認証**を有効化（必須）
- [ ] Apple Developer Program に登録（個人 / 組織 / Enterprise から選択、年間 $99）

> ⚠️ **個人 vs 組織の選び分け**: 個人だとアプリの開発元名が本名になる（屋号不可）。後から組織に切替は不可で、新規取得し直しが必要。事業として出すなら最初から組織で取得。

---

## 2. D-U-N-S 番号（組織のみ）

- [ ] 組織登録の場合: **D-U-N-S 番号**を取得（Dun & Bradstreet で無料）

> ⚠️ **D-U-N-S は時間がかかる**: 反映に **1〜4 週間**かかることがあり、Apple Developer 側で照合できないと登録が止まる。**登記情報と完全に一致する**名前 / 住所で取得する（途中で修正不可）。

---

## 3. Agreements / Tax / Banking

App Store Connect → `Business` → `Agreements, Tax, and Banking`。

- [ ] **Free Apps Agreement** に署名（基本必須）
- [ ] **Paid Apps Agreement** に署名（有料アプリ / IAP / 広告収益化する場合）
- [ ] **Tax Forms** 入力（W-8BEN など、米国非居住者でも要提出）
- [ ] **Banking Information** 登録（受け取り口座、収益化する場合）

> 💡 法人で日本円の口座を使う場合、SWIFT コード / 中継銀行情報が必要。地銀だと SWIFT 持っていない場合があるので事前確認。

---

## 4. EU 配信時の Trader Status（DSA）

- [ ] EU に配信する予定があるなら **Trader Status** を申告（DSA 対応、2024 年 2 月以降必須）

> ⚠️ Trader 宣言なしで EU 向けに配信を続けると、2025 年 2 月以降は段階的に削除対象。個人開発でも EU に出すなら必須。

---

## 5. 共通鍵類（Distribution Cert / APNs Auth Key）

アプリ単位ではなく**チーム単位で共有**できる鍵類。最初に一度作っておけば全アプリで使い回せる。

- [ ] **Distribution Certificate** を作成（または Xcode の Automatically manage signing に任せる）
- [ ] Push Notification を将来使う予定があるなら **APNs Auth Key（.p8）** を作成
  > 💡 .p8 は無期限。証明書ベース（.p12、年次更新）より楽。チーム内 1 つで全アプリ共有可能。
- [ ] CI を使うなら鍵類を 1Password / SSM などに暗号化保管

---

## ノート / ブロッカー（自由記入）

> 日付付きで作業ログを残す。アカウント周りは「いつ何をどの名義で取ったか」が重要なので記録しておくと後で楽。

(まだ何も記録なし)
