# 人生スケジュール — チャット内容・UI画像の図解

会話で合意した機能と、`docs` 内のワイヤー PNG の対応を一枚に整理したものです。

## 改善の設計図解（2026-05 追記）

チャットで悩みながら積み上げた改善内容を、画面モックと「悩み→改善」対応表にまとめた **HTML 図解** をリポジトリに同梱しています。

| 形式 | 場所 |
|------|------|
| 公開 URL | https://diagram-life-schedule-improvements.surge.sh/ |
| ローカル HTML | [`design-improvements-diagram.html`](design-improvements-diagram.html)（Surge と同一内容） |
| 画面・操作（旧） | https://diagram-life-schedule-tool.surge.sh/ |

ブラウザで HTML を開くか、上記 Surge URL を参照してください。

---

## 1. 画面レイアウト（情報構造）

```mermaid
flowchart TB
  subgraph bar["北極星バー（年列の上／狭い画面はカレンダー上）"]
    B1["理念"]
    B2["目的・ビジョン"]
    B3["目標"]
    B4["プライムシート"]
    B5["自分100年史"]
    B6["やりたいこと100"]
  end

  subgraph panes["四ペイン（単一カーソル）"]
    P1["中長期・年間行動計画\n・2026起点・下へ未来\n・スコープコメント抜粋\n・年号クリック→詳細"]
    P2["月\n・コメント抜粋\n・年月ラベルの数字部クリック→詳細"]
    P3["週（月曜始まり）\n・コメント抜粋\n・週識別子クリック→詳細"]
    P4["日\n・終日行\n・24hタイムライン\n・クリック新規（終日/60分）"]
  end

  bar --> P1
  P1 --> P2 --> P3 --> P4
```

---

## 2. クリックで開くオーバーレイ（2系統）

```mermaid
flowchart LR
  subgraph north["北極星ボタン（4つ）"]
    N1["理念/目的/目標/\nプライムシート"]
  end

  subgraph northOverlay["同型オーバーレイ"]
    L["一覧"]
    F["新規フォーム\nタイトル必須・任意メモ"]
  end

  subgraph scope["年・月・週の数字（主ラベル）"]
    S1["年号 / 年月の数字部 / 週キー"]
  end

  subgraph scopeOverlay["スコープ詳細オーバーレイ"]
    H["見出し（どの年・月・週か）"]
    C["コメント全文編集\n保存・閉じる"]
  end

  north --> northOverlay
  scope --> scopeOverlay
```

**役割分担（カーソルと衝突しないように）**

- **数字（主ラベル）クリック** → 右の「スコープ詳細」オーバーレイ。
- **行・セルの他領域クリック** → 単一カーソルのみ移動（実装でヒット領域を設計）。

---

## 3. 日ペインのルール（要約）

```mermaid
flowchart TB
  D1["終日行をクリック"] --> E1["終日予定を新規"]
  D2["タイムラインをクリック"] --> E2["時刻付き新規\n既定60分"]
  D3["重なり"] --> E3["横並び分割 +N"]
  D4["今日を表示"] --> E4["表示直後スクロール\n現在時刻付近"]
  D5["編集・移動・リサイズ"] --> E5["MVP: ドラッグなし\n中央モーダルで編集"]
```

---

## 4. データ・永続化（MVP方針）

```mermaid
flowchart LR
  subgraph client["ブラウザ内（正本）"]
    EV["予定（単発）"]
    NS["理念/目的/目標/\nプライムシート項目"]
    SC["年・月・週\nスコープコメント"]
  end

  subgraph backup["JSON 書き出し/読込"]
    J["1ファイルまたは\nセクション分割（未決）"]
  end

  client --> backup
```

- 予定インポート: **ID upsert**。
- タイムゾーン: **ブラウザローカルのみ**。
- 狭い画面: **年/月/週/日タブ**、広いとき **四列**。

---

## 5. UIワイヤー PNG との対応

| ファイル | 図の役割 |
|----------|----------|
| `life-schedule-ui-wireframe.png` | 四ペイン + 終日/タイムラインの基本形。 |
| `life-schedule-ui-north-star-modal.png` | 旧: 北極星 **3ボタン** + モーダル（プライムシートなし）。 |
| `life-schedule-ui-north-star-4btns-scope-modal.png` | **4ボタン** + 年・月・週のコメント感 + **スコープコメント用モーダル**のラフ。 |

### 画像（同一フォルダの PNG をそのまま表示）

![四ペイン基本ワイヤー](life-schedule-ui-wireframe.png)

![北極星3ボタン＋モーダル（旧ラフ）](life-schedule-ui-north-star-modal.png)

![4ボタン＋スコープコメント](life-schedule-ui-north-star-4btns-scope-modal.png)

**絶対パス（このマシン）**

- `C:\Users\komeda\src\life-schedule\docs\life-schedule-ui-wireframe.png`
- `C:\Users\komeda\src\life-schedule\docs\life-schedule-ui-north-star-modal.png`
- `C:\Users\komeda\src\life-schedule\docs\life-schedule-ui-north-star-4btns-scope-modal.png`

### スクリーンショット（実画面・参考）

![四列カレンダーUI](life-schedule-screenshot-4column-ui.png)

![北極星3ボタン＋理念モーダル](life-schedule-screenshot-north-star-3btn-modal.png)

![北極星4ボタン＋スコープコメント](life-schedule-screenshot-4btn-scope-comment.png)

- `C:\Users\komeda\src\life-schedule\docs\life-schedule-screenshot-4column-ui.png`
- `C:\Users\komeda\src\life-schedule\docs\life-schedule-screenshot-north-star-3btn-modal.png`
- `C:\Users\komeda\src\life-schedule\docs\life-schedule-screenshot-4btn-scope-comment.png`

---

## 6. 詳細仕様の全文

細かい表は **`design-spec-2026-05-14.md`** を参照してください。

`C:\Users\komeda\src\life-schedule\docs\design-spec-2026-05-14.md`
