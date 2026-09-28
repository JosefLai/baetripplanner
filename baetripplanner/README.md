# BaeTripPlanner

自建的個人行程規劃工具,取代 TripMapper 訂閱。Airtable 風格的可自訂表格/卡片檢視,地點卡片可直接開 Google 地圖,預算只算 CAD,附件(照片、票券、PDF)在瀏覽器內直接預覽、不用下載。

## 技術棧

- Next.js 16(App Router)+ TypeScript + Tailwind CSS
- Supabase(PostgreSQL + Auth + Storage)— 已建好的專案:`Baetripplanner` (us-west-2)

## 本機開發

1. 安裝套件:

   ```bash
   npm install
   ```

2. 複製環境變數檔:

   ```bash
   cp .env.local.example .env.local
   ```

   裡面已經填好 Supabase 專案的 URL 跟 publishable key(這兩個是設計給前端公開使用的,不是密鑰)。

3. 啟動開發伺服器:

   ```bash
   npm run dev
   ```

   打開 http://localhost:3000,用任何 Email 登入(會收到一封「登入連結」信,點了就登入,不用密碼)。

## 部署(免費)

推薦用 [Vercel](https://vercel.com):把這個 repo 接上 Vercel,環境變數設定裡貼上 `.env.local.example` 裡的兩個值,一鍵部署即可。

## 資料庫

Schema、Row Level Security 規則、Storage bucket 都已經在 Supabase 專案裡建好(見 `supabase/schema.sql` 留存的備份)。資料表:

- `trips` — 行程主表(名稱、日期、封面照片)
- `trip_members` — 協作者(沒有角色分別,加進來就是完整編輯權限)
- `items` — 每個行程項目/卡片(地點、時間、預算、狀態……),`custom_fields` 這個 JSON 欄位讓你在不改資料庫結構的情況下加自訂欄位
- `field_definitions` — 定義每個行程有哪些自訂欄位
- `checklists` / `checklist_items` — 打包清單等待辦清單
- `attachments` — 每個行程或每個項目的附件,存在 Supabase Storage 的 `trip-attachments` bucket(公開讀取,登入者才能上傳/刪除)

## 目前完成度(MVP)

- [x] Email 登入(magic link)
- [x] 行程 CRUD + 封面照片上傳
- [x] 行程項目:表格檢視(Airtable 風格,點格子直接編輯)+ 卡片檢視
- [x] 每個項目一鍵開 Google 地圖(用地址自動組連結)
- [x] 預算加總(CAD)
- [x] 附件上傳 + 瀏覽器內預覽(圖片/PDF/影片/音檔),不用下載
- [ ] 自訂欄位管理介面(資料庫已支援,UI 待做)
- [ ] 協作者邀請介面(資料庫已支援,UI 待做)
- [ ] 打包清單 UI
- [ ] PWA 離線模式
