# HANDOFF: dự án web đăng ký khóa tu Thiền Tôn Phật Quang (bàn giao sang Claude mới)

Cập nhật: **12/11/2026 (tuần 10 của đợt thực tập)**. File này tóm tắt toàn bộ cuộc trò chuyện trước và tình trạng dự án. **Đọc hết trước khi làm gì.** Mục nào ghi "chưa xác minh" thì hỏi lại người dùng, đừng tự khẳng định. Từ 28/10 đến 12/11 không có thông tin gì về việc người dùng đã làm: hỏi lại tiến độ thực tế.

> **Gấp:** báo cáo lần 2 hạn **23:59 Chủ nhật 15/11/2026** (còn 3 ngày kể từ 12/11). Xem mục 7 và 8.

## 0. Đoạn nhắc để dán vào cuộc trò chuyện mới

> Mình là Nguyễn Vũ Tuấn Anh, sinh viên Đại học Thăng Long đang thực tập tốt nghiệp. Đính kèm là HANDOFF.md và project zip từ cuộc trò chuyện trước. Hãy đọc HANDOFF.md, giải nén project, xác nhận lại với mình bạn hiểu: (1) mục tiêu, (2) tình trạng hiện tại, (3) việc tiếp theo. Sau đó giúp mình làm tiếp từ mục 8, ưu tiên báo cáo lần 2. Hôm nay là ngày __ (tuần __).

Cách dùng trên claude.ai (gói Pro): tạo một **Project**, thêm `HANDOFF.md` và zip vào Project knowledge, rồi dán đoạn trên vào chat đầu tiên của Project.

## 1. Người dùng và cách làm việc

- Nguyễn Vũ Tuấn Anh, mã sinh viên A42543, ngành Công nghệ thông tin, Trường Đại học Thăng Long (Hà Nội). Thực tập tốt nghiệp **tại trường**; GVHD: ThS. Tân Văn Sơn (cách viết tên do người dùng gõ, chưa xác minh).
- Dùng **Windows**, VS Code. Xưng hô thân mật ("t/m"), **luôn trả lời tiếng Việt**, ngắn gọn.
- Người dùng làm theo hướng dẫn rất sát chữ. Quy ước đã rút ra:
  - Mỗi lệnh terminal đặt trong **một khối code riêng**, không gộp nhiều dòng. Lệnh gồm hai đường dẫn (như `xcopy`) phải nằm trên **một dòng**.
  - Không đưa ký hiệu thừa (dấu huyền, ngoặc) sát lệnh. Từng có lần người dùng gõ `node-v` kèm dấu huyền.
  - Khi lỗi, người dùng chụp màn hình hoặc dán log. Đọc kỹ log rồi mới kết luận.
  - Không bịa thông tin cá nhân hay tiến độ. Chỗ chưa biết thì tô vàng hoặc hỏi.
- Mục tiêu người dùng: hoàn thành đề tài đúng hạn, có sản phẩm demo chạy được, báo cáo đúng mẫu của trường.

## 2. Quy trình thực tập của trường (từ ảnh và file người dùng gửi)

Tuần 1 bắt đầu thứ Hai **07/09/2026**; tuần n bắt đầu 07/09 + 7(n-1) ngày. Tuần 10 là 09/11 đến 15/11.

| Mốc | Hạn nộp (23:59 Chủ nhật) | Nội dung (sinh viên thực tập tại trường) | Minh chứng bắt buộc | Tiêu chí đạt |
|---|---|---|---|---|
| Lần 1 (tuần 7) | 25/10/2026 | Tên đề tài, mục tiêu, yêu cầu do GVHD giao; công nghệ dự kiến; kế hoạch theo tuần đến hết tuần 13 | Giấy xác nhận thực tập (BM-TT02/TT03) đã nộp; nhật ký công việc các tuần | Đúng mẫu BM-TT04, đủ mục; đề tài khớp nội dung GVHD giao; có kế hoạch theo tuần cụ thể |
| Lần 2 (tuần 10) | **15/11/2026** | Phân tích, thiết kế giải pháp; quá trình thực hiện, công nghệ; kết quả tạm thời (sản phẩm demo); đối chiếu tiến độ với kế hoạch lần 1 | Nhật ký công việc tuần; ảnh chụp màn hình sản phẩm, link mã nguồn | Kế thừa và phát triển từ lần 1; kết quả tạm thời có minh chứng; tiến độ phù hợp kế hoạch (chậm phải nêu lý do) |
| Lần 3 (tuần 13) | 06/12/2026 | Sản phẩm hoàn chỉnh; đánh giá kết quả, hạn chế, hướng phát triển; tổng kết, bài học kinh nghiệm | Toàn bộ nhật ký; sản phẩm và mã nguồn hoàn chỉnh; giấy đánh giá BM-TT05 (áp dụng cho SV ngoài trường) | Hoàn chỉnh trên cơ sở lần 1 và 2, nội dung nhất quán; khớp minh chứng; đạt kiểm tra trùng lặp |

- GVHD nhận xét: lần 1 trong tuần 8 (26 đến 30/10), lần 2 trong tuần 11 (16 đến 20/11). Giai đoạn chấm điểm: tuần 14 đến 16 (07/12 đến 27/12); nhập điểm lên hệ thống ngày 23/12.
- Nộp trên trang quản lý thực tập của trường và nộp trực tiếp cho GVHD. Có hai địa chỉ xuất hiện trong tài liệu: `http://103.149.170.20/login` (ảnh quy trình) và `http://157.10.42.165/login` (bảng theo dõi). Chưa rõ cái nào đang dùng, hỏi người dùng.
- Xử lý vi phạm: nộp muộn không quá 3 ngày thì trừ điểm quá trình; thiếu từ 2 lần nộp hoặc không nộp lần 3 thì không đủ điều kiện chấm; lần 3 không nhất quán hoặc sao chép nội dung người khác thì GVHD không xác nhận. Có lý do chính đáng thì báo GVHD trước hạn để gia hạn tối đa 1 tuần. Ý chính: **không sao chép nội dung người khác.**
- Mẫu trình bày (Phụ lục số 06, file `.doc` người dùng gửi): Times New Roman 13, giãn dòng 1,3, lề trên/dưới 2 cm, trái 3 cm, phải 2 cm, số trang giữa cuối trang bắt đầu từ Chương 1. Cấu trúc: bìa, lời cảm ơn, mục lục, danh mục viết tắt, danh mục bảng biểu, mở đầu, các chương, kết luận, tài liệu tham khảo, phụ lục. Bìa lần 1 chỉ có **một** bìa (người dùng yêu cầu bỏ bìa lặp), có logo trường dưới dòng Khoa CNTT.

## 3. Dự án: mục tiêu và quyết định đã chốt

- **Đề tài:** Xây dựng hệ thống quản lý và tiếp nhận đăng ký khóa tu, sự kiện Phật giáo cho Thiền Tôn Phật Quang (https://thientonphatquang.com). Đề tài đã chốt với GVHD.
- Yêu cầu của người dùng: **đơn giản, dễ triển khai, dễ phát triển thêm nếu còn thời gian**.
- **Stack:** Next.js 14 (App Router, TypeScript) + Supabase (PostgreSQL, Auth) + Tailwind CSS 3 + deploy Vercel. Dùng `@supabase/ssr`. Không nâng Next lên 15 (cookies() bất đồng bộ).
- App **độc lập**, không sửa website chính. Chỉ tiếng Việt. Không làm thanh toán (website chính có trang cúng dường riêng). Không tự tính âm lịch: admin **nhập tay** `lunar_text` (ví dụ "14–15/4 AL").
- Người đăng ký **không cần tài khoản**: nhận mã `PQ-XXXXXX`, tra cứu và hủy bằng mã + số điện thoại.
- **Bảo mật:** RLS bật trên mọi bảng, người ẩn danh không đọc/ghi trực tiếp bảng nào. Mọi thao tác công khai đi qua 4 hàm Postgres `security definer`: `list_public_events`, `register_for_event`, `lookup_registration`, `cancel_registration`. Quản trị viên xác định bằng bảng `admins` + hàm `is_admin()`. Chỉ dùng **anon/publishable key** ở ứng dụng, **không bao giờ** dùng `service_role`.
- **Chống vượt số chỗ:** `register_for_event` khóa dòng sự kiện (`for update`), đếm đăng ký `pending` + `approved`; từ chối hoặc hủy thì nhả chỗ. Chống trùng: cùng họ tên + số điện thoại. Chống spam: ô honeypot `website`.
- Xuất danh sách: **CSV UTF-8 có BOM** (Excel đọc đúng tiếng Việt), giữ số 0 đầu của số điện thoại, chống CSV injection.

## 4. Thông tin từ website thiền tôn

- Loại hoạt động: khóa thiền hằng tháng (ví dụ 02 đến 04/10/2026 tại chùa Từ Tân), đại lễ theo âm lịch, lễ Quy y Tam Bảo (trang `/dang-ky-quy-y`), thuyết giảng, tham vấn thiền.
- Địa điểm: Chùa Phật Quang (Núi Dinh, khu phố Chu Hải, phường Tân Hải, TP.HCM); Chùa Từ Tân (90/153 Trường Chinh, phường Bảy Hiền). Điện thoại +84 (254) 8376 543. Có YouTube, Facebook riêng.
- Trang Lịch tu học: Phật Thành Đạo (07/12 AL, 14/01/2027), Tết Nguyên Đán (1–6/1 AL, 06/02/2027), Rằm tháng Giêng (15/1 AL, 20/02/2027), Phật Đản (14–15/4 AL, 19/05/2027), Vu Lan (14–15/7 AL, 15/08/2027), Rằm Trung Thu và Trai đàn chẩn tế (15/8 AL, 15/09/2027).
- Website chính có ảnh hero toàn màn hình, chữ serif, bố cục thoáng, tagline "Nơi tâm hồn tìm về chốn bình yên...". **Chưa mở** trang `/dang-ky-quy-y` để xem form quy y hiện có. Ảnh trên website là của thiền tôn: cần xin phép trước khi dùng.

## 5. Trạng thái code (trong zip)

Hoàn thành (đã qua `tsc --noEmit`; **chưa kiểm thử end-to-end trên Supabase thật** ngoài việc trang chủ đã chạy ngày 28/10):
- Công khai: `/` (hero, sự kiện sắp tới, lưới thẻ có lọc loại, sự kiện đã qua), `/su-kien/[slug]`, `/su-kien/[slug]/dang-ky`, `/dang-ky/thanh-cong`, `/tra-cuu`.
- Quản trị: `/admin/login`, `/admin` (danh sách sự kiện kèm số chờ duyệt/đã duyệt), `/admin/su-kien/moi`, `/admin/su-kien/[id]` (thống kê, bảng đăng ký có tìm kiếm/lọc, duyệt/từ chối, form sửa), `/admin/su-kien/[id]/export` (CSV), `/admin/dia-diem`.
- Giao diện (bản mới nhất, 28/10): nền giấy ấm `#F5F2EA`, chính `pine #1F3D36`, vàng y `saffron #C28A2C`; font Newsreader (tiêu đề) + Be Vietnam Pro; họa tiết vòng ensō (`Enso.tsx`); thẻ sự kiện `EventCard.tsx` có ảnh bìa; footer có liên hệ và link MXH. Nền hero dùng `public/images/hero.jpg` nếu có.
- Ảnh bìa sự kiện: cột `events.cover_url` (admin dán link https). **Cần chạy `supabase/migrations/001_anh_bia.sql`** sau `schema.sql`, nếu không trang chủ lỗi (hàm `list_public_events` đổi kiểu trả về).

Cấu trúc: `supabase/schema.sql`, `supabase/seed.sql`, `supabase/migrations/001_anh_bia.sql`, `middleware.ts`, `src/lib/{actions,auth,events,format,types}.ts`, `src/lib/supabase/server.ts`, `src/app/**`, `src/components/**`. `src/components/EventRow.tsx` là file cũ không còn dùng (có thể xóa). Chi tiết route: xem `README.md` và Phụ lục của báo cáo.

Bảng dữ liệu: `venues`, `events` (slug, title, event_type, description, venue_id, cover_url, start_date, end_date, lunar_text, capacity [null = không giới hạn], registration_open, published), `registrations` (code, event_id, full_name, dharma_name, phone dạng 0xxxxxxxxx, birth_year, gender nam/nu, province, is_first_time, needs_lodging, notes, status pending/approved/rejected/cancelled), `admins`.

Lưu ý kỹ thuật: file `'use server'` chỉ export hàm async (kiểu dữ liệu để ở `types.ts`); `useFormState`/`useFormStatus` từ `react-dom`; admin pages dùng route group `(panel)` với `requireAdmin()`; seed có 2 địa điểm + 7 sự kiện (ngày lấy từ trang Lịch tu học nên cần đối chiếu; "Khóa thiền tháng 11" là dữ liệu mẫu tự đặt và đã qua ngày, mọi sự kiện gắn Chùa Phật Quang theo giả định).

## 6. Môi trường máy người dùng và lỗi đã gặp

- Supabase project đã tạo; `schema.sql` và `seed.sql` đã chạy thành công ngày 10/10/2026. `.env.local` đã có URL + publishable key (**không** ghi key vào bất kỳ file nào gửi đi). Người dùng chưa trả lời đã tạo **tài khoản admin** (Authentication > Users + lệnh `insert into public.admins`) hay chưa: hỏi lại.
- Node.js cài bằng `winget install OpenJS.NodeJS.LTS` (v24 LTS). PowerShell chặn script: sửa bằng `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- **Ổ C** từng gần đầy (0,16 GB trống) gây lỗi `ENOSPC`; người dùng đã dọn. **Ổ D** (138 GB trống) chặn ghi (`EPERM`, `mkdir D:\dev` bị từ chối) kể cả khi tắt Controlled folder access; nguyên nhân chưa xác định (nghi quyền ACL hoặc phần mềm diệt virus). **Đừng đưa project về ổ D** trừ khi đã sửa được.
- Project đang chạy ở **`C:\dev\phat-quang-dang-ky`** (bản gốc nằm ở `D:\phat-quang-dang-ky\phat-quang-dang-ky`, lồng hai lớp cùng tên). Đã chạy `npm config delete cache` để bỏ cấu hình cache sang ổ D. `npm install` thành công (116 packages, cảnh báo 3 vulnerabilities).
- **Không chạy `npm audit fix --force`** (nâng Next sai bản, hỏng code). Trước khi deploy, xem `npm audit` và nâng Next/thư viện lên bản vá trong nhánh 14.2.x một cách có kiểm soát.
- Ngày 28/10 người dùng chạy được `npm run dev` ở `http://localhost:3000` (bản giao diện cũ), nhận xét "hơi phèn" nên giao diện đã được làm lại (mục 5). Bản cập nhật (`cap-nhat-giao-dien.zip`) đã gửi nhưng **chưa xác nhận người dùng đã áp dụng** và chạy migration. Bản zip bàn giao này đã gồm sẵn giao diện mới.

## 7. Báo cáo lần 1 (đã soạn)

- File: `docs/BaoCao_TTTN_Lan1.docx` (+ PDF xem trước), 22 trang: bìa (có logo trường), lời cảm ơn, mục lục, danh mục viết tắt, danh mục bảng biểu, mở đầu, 3 chương, kết luận, 12 tài liệu tham khảo, phụ lục (danh sách route).
- Chương 1: tổng quan, bối cảnh nghiệp vụ, mục tiêu, yêu cầu chức năng/phi chức năng, phạm vi. Chương 2: cơ sở lý thuyết (Next.js/React/TypeScript, Tailwind, PostgreSQL, RLS, `SECURITY DEFINER`, Supabase Auth, Vercel/Git, đăng ký đồng thời và khóa dòng, bảo vệ dữ liệu cá nhân theo NĐ 13/2023/NĐ-CP, bảng so sánh phương án). Chương 3: kiến trúc (Hình 3.1), dữ liệu (Bảng 3.1), phân quyền (Bảng 3.2), quy trình đăng ký, kết quả đến tuần 7 (Bảng 3.3), **kế hoạch tuần 7 đến 13** (Bảng 3.4), rủi ro (Bảng 3.5), kịch bản kiểm thử.
- Kế hoạch Bảng 3.4 cần đối chiếu ở lần 2: tuần 8 kiểm thử với dữ liệu thật; tuần 9 deploy Vercel + bắt đầu use case/ERD; tuần 10 hoàn thiện phân tích thiết kế, nộp lần 2; tuần 11 check-in QR; tuần 12 thống kê, phân phòng (tùy tiến độ), kiểm thử tổng thể; tuần 13 hoàn thiện, demo, nộp lần 3. Nếu thực tế chậm hơn, báo cáo lần 2 phải **nêu lý do** (tiêu chí của trường).
- Chưa xác minh: dòng "Tuần 6 đến 7" trong Bảng 3.3 (ghi "Đang thực hiện: cài đặt môi trường, kết nối Supabase, chạy thử"); lớp của sinh viên không có trong báo cáo; mục 1.5 chưa đối chiếu với yêu cầu GVHD thực sự giao; mục lục là số trang tính từ bản render LibreOffice nên Word có thể lệch 1 trang. **Chưa biết người dùng đã nộp báo cáo lần 1 hay chưa**: hỏi.
- File Word được tạo bằng docx-js rồi vá XML trực tiếp; mã nguồn script không còn. Với lần 2 hãy tạo lại bằng docx-js hoặc python-docx theo cùng mẫu định dạng (mục 2) và **kế thừa cấu trúc, văn phong, bảng, hình của lần 1** (mở file docx để lấy). Hình 3.1 là sơ đồ kiến trúc vẽ bằng matplotlib (người dùng hoặc Claude có thể vẽ lại).

## 8. Việc cần làm tiếp (ưu tiên)

1. **Hỏi người dùng ngay:** đã nộp báo cáo lần 1 chưa và GVHD nhận xét gì; đã áp dụng giao diện mới và chạy `001_anh_bia.sql` chưa; đã có tài khoản admin chưa; đang chạy được `npm run dev` không; đã làm được gì từ 28/10 (deploy? kiểm thử? check-in?).
2. **Báo cáo lần 2 (hạn 15/11):** Chương phân tích thiết kế gồm use case (sơ đồ + đặc tả), ERD đầy đủ (từ `schema.sql`), thiết kế kiến trúc và luồng xử lý chính (sequence cho đăng ký/duyệt), thiết kế giao diện (mockup/ảnh chụp màn hình thật), quá trình thực hiện và công nghệ, kết quả tạm thời có minh chứng (ảnh chụp màn hình, link mã nguồn/demo), đối chiếu tiến độ với Bảng 3.4 của lần 1, kế thừa lần 1. Đánh số bảng/hình, dẫn nguồn, trích dẫn đúng mẫu, tránh sao chép.
3. **Nhật ký công việc các tuần 4 đến nay** (minh chứng bắt buộc, chưa làm): soạn theo thực tế, người dùng xác nhận ngày làm từng việc.
4. Thử trọn luồng: đăng ký, nhận mã, tra cứu, hủy, đăng nhập admin, duyệt, tải CSV; thử đăng ký trùng và vượt số chỗ. Chụp màn hình làm minh chứng. Sửa lỗi phát sinh.
5. Thay dữ liệu mẫu bằng dữ liệu thật; thêm ảnh hero/ảnh bìa (xin phép thiền tôn).
6. Đưa code lên GitHub, deploy Vercel, nâng cấp thư viện có lỗ hổng (xem mục 6), đặt biến môi trường và Site URL trên Supabase.
7. Tính năng mở rộng (mỗi cái độc lập): nút "Thêm vào lịch" (.ics), check-in QR (bảng `checkins`), thống kê và biểu đồ, email xác nhận, danh sách chờ, phân phòng lưu trú (`rooms`, `room_assignments`), `event_sessions`, xuất .xlsx, nhiều vai trò admin, Cloudflare Turnstile.
8. Báo cáo lần 3 (hạn 06/12): sản phẩm hoàn chỉnh, kịch bản kiểm thử (Mục 3.8 của lần 1 là dàn ý), đánh giá, hạn chế, hướng phát triển.

## 9. Tóm tắt diễn biến cuộc trò chuyện trước

1. Người dùng gửi ảnh quy trình thực tập và muốn làm web quản lý đăng ký khóa tu cho Thiền Tôn Phật Quang. Claude đề xuất phạm vi và module; người dùng chọn phương án đơn giản nhất.
2. Chốt Next.js + Supabase + Vercel. Claude xem website thiền tôn, điều chỉnh mô hình dữ liệu (âm lịch, loại sự kiện, địa điểm).
3. Claude dựng MVP đầy đủ (code, SQL, README), kiểm tra kiểu và build, đóng gói zip và `HANDOFF.md` bản đầu.
4. Tuần 5: lập lộ trình theo mốc báo cáo; người dùng chạy `schema.sql` và `seed.sql` trên Supabase (10/10/2026).
5. Tuần 7: người dùng gửi bảng tiêu chí 3 lần báo cáo, bảng theo dõi tiến độ và mẫu `.doc`. Claude soạn báo cáo lần 1 (Word + PDF) đúng mẫu; sau đó cập nhật thông tin sinh viên/GVHD, bỏ bìa lặp, thêm logo trường.
6. Chạy local trên máy người dùng: gặp lỗi thiếu Node.js, PowerShell chặn script, `EPERM` trên ổ D, `ENOSPC` trên ổ C; giải quyết bằng cài Node qua winget, đổi execution policy, dọn ổ C và chạy project ở `C:\dev`. Trang chủ chạy được ngày 28/10.
7. Người dùng nhận xét giao diện "hơi phèn"; Claude làm lại giao diện theo phong cách website thiền tôn, thêm ảnh bìa sự kiện và migration. Sau đó người dùng yêu cầu đóng gói để chuyển sang tài khoản Claude Pro, dẫn đến file này.

## 10. Danh sách file trong gói bàn giao

- `HANDOFF.md` (file này), `README.md` (cách chạy, tạo admin, deploy).
- `docs/BaoCao_TTTN_Lan1.docx`, `docs/BaoCao_TTTN_Lan1_xem-truoc.pdf`.
- Toàn bộ mã nguồn (không gồm `node_modules`; chạy `npm install` để cài).
