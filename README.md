# Đăng ký khóa tu và sự kiện - Thiền Tôn Phật Quang

Web app quản lý và tiếp nhận đăng ký khóa tu, đại lễ. Next.js 15 (App Router) + Supabase + Tailwind, deploy trên Vercel.

## Chạy thử trên máy

1. Tạo project tại https://supabase.com (gói miễn phí).
2. Vào **SQL Editor**, chạy lần lượt: `supabase/schema.sql`, `supabase/migrations/001_anh_bia.sql`, (tùy chọn) `supabase/seed.sql`, `supabase/migrations/002_anh_bia_su_kien.sql` (gắn ảnh bìa cho sự kiện mẫu), `supabase/migrations/003_nhat_ky_thao_tac.sql` (nhật ký thao tác), `supabase/migrations/004_du_lieu_chinh_thuc.sql` (cập nhật dữ liệu theo lịch chính thức), rồi `supabase/migrations/005_check_in.sql` (check-in bằng mã QR).
3. Sao chép `.env.example` thành `.env.local`, điền `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > API; chỉ dùng khóa anon/publishable, không dùng service_role).
4. Cài và chạy (cần Node.js LTS):
   ```bash
   npm install
   npm run dev
   ```
   Mở http://localhost:3000.

## Tạo tài khoản quản trị

1. Supabase: **Authentication > Users > Add user**, nhập email và mật khẩu (tích "Auto confirm").
2. Cấp quyền admin, chạy trong SQL Editor (thay email của bạn):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-cua-ban@example.com';
   ```
3. Đăng nhập tại `/admin/login`.

## Deploy

1. Đưa code lên GitHub.
2. Vercel > Add New Project > chọn repo, thêm 2 biến môi trường như `.env.local`, bấm Deploy.
3. Supabase > Authentication > URL Configuration: điền địa chỉ Vercel vào Site URL.

## Cấu trúc

- `supabase/`: `schema.sql` (bảng, RLS, hàm đăng ký/tra cứu/hủy), `seed.sql` (dữ liệu mẫu), `migrations/` (thay đổi về sau).
- `src/app`: các trang. Công khai: `/`, `/su-kien/[slug]`, `/su-kien/[slug]/dang-ky`, `/dang-ky/thanh-cong`, `/tra-cuu`. Quản trị: `/admin/*`.
- `src/lib/actions.ts`: toàn bộ server action. `src/components`: giao diện dùng chung.
- `public/images/hero.jpg`: ảnh nền trang chủ (ảnh Đại lễ Vu Lan 2026 của thiền tôn; thay được, giữ tên file).
- `docs/`: báo cáo thực tập lần 1.

Bối cảnh, quyết định thiết kế và việc cần làm tiếp: xem `HANDOFF.md`.

## REST API

API công khai cho người đăng ký, cùng logic và cùng hàm kiểm tra dữ liệu với giao diện web:

| Phương thức | Đường dẫn | Việc |
|---|---|---|
| GET | `/api/v1/events?type=&upcoming=true` | Danh sách sự kiện |
| GET | `/api/v1/events/{slug}` | Chi tiết sự kiện |
| POST | `/api/v1/registrations` | Đăng ký (201 / 400 / 404 / 409) |
| POST | `/api/v1/registrations/lookup` | Tra cứu bằng mã + số điện thoại |
| POST | `/api/v1/registrations/cancel` | Tự hủy |

Tài liệu: trang `/tai-lieu-api`, đặc tả OpenAPI 3.0 tại `/api/v1/openapi.json`.
Lỗi luôn có dạng `{ "error": { "code", "message", "fields"? } }`.

## Kiểm thử

- `npm test`: kiểm thử đơn vị phần kiểm tra dữ liệu và phần thống kê (`tests/unit`). Cần Node 22.6 trở lên.
- `npm run test:api`: kiểm thử tích hợp API trên Supabase thật (`tests/api`): 50 người đăng ký cùng lúc vào sự kiện 10 chỗ, đăng ký trùng, tra cứu sai số điện thoại, hủy và nhả chỗ, nhật ký thao tác; check-in (khách không gọi được, chờ duyệt thì chặn, quét hai lần, 5 lần quét cùng lúc chỉ ghi nhận một, đã check-in thì không tự hủy được).
  Cần `npm run dev` đang chạy ở terminal khác và thêm vào `.env.local`:
  ```
  TEST_ADMIN_EMAIL=email-admin
  TEST_ADMIN_PASSWORD=mat-khau-admin
  ```
  Bài test tự tạo một sự kiện tạm và tự xóa khi xong.
- GitHub Actions (`.github/workflows/ci.yml`) tự chạy kiểm thử và build mỗi lần đẩy code.

## Nhật ký thao tác

`supabase/migrations/003_nhat_ky_thao_tac.sql` tạo bảng `audit_logs` và trigger: tự ghi khi tạo/sửa/xóa sự kiện và khi đổi trạng thái đăng ký (kể cả người đăng ký tự hủy). Chỉ admin đọc được; không ai sửa hay xóa được nhật ký qua API. Xem trong trang quản trị của từng sự kiện.


## Check-in bằng mã QR

`supabase/migrations/005_check_in.sql` thêm cột `checked_in_at`, `checked_in_by` và hàm `check_in_registration(mã, duyệt_luôn)`.

- Người đăng ký thấy mã QR ở trang đăng ký thành công và khi tra cứu. Mã QR chỉ chứa đường dẫn `/admin/check-in?ma=PQ-XXXXXX`, không chứa tên hay số điện thoại.
- Ban tổ chức quét bằng camera điện thoại, đăng nhập (nếu chưa) rồi bấm **Check-in**. Đăng ký đang chờ duyệt có nút **Duyệt và check-in**. Có thể nhập mã tay ở trang Check-in, hoặc bấm Check-in ngay trong danh sách của sự kiện.
- Hàm khóa dòng (`FOR UPDATE`) nên hai người quét cùng một mã cùng lúc chỉ ghi nhận một lần. Đã check-in thì người đăng ký không tự hủy được và quản trị viên không đổi trạng thái được nữa. Mỗi lần check-in được ghi vào nhật ký thao tác.

## Thống kê

Trang quản trị của mỗi sự kiện có phần Thống kê: số có mặt trên số đã duyệt, giới tính, độ tuổi, nơi ở nhiều nhất, số đăng ký theo ngày. Phần tính toán nằm ở `src/lib/stats.ts` (hàm thuần, có kiểm thử đơn vị). File CSV có thêm cột Check-in.
