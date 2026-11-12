-- Dữ liệu mẫu (không bắt buộc). Chạy sau schema.sql.
-- Các ngày đại lễ lấy từ trang "Lịch tu học" của thientonphatquang.com, hãy đối chiếu lại trước khi dùng thật.

insert into public.venues (name, address, map_url) values
  ('Chùa Phật Quang', 'Khu phố Chu Hải, phường Tân Hải, TP. Hồ Chí Minh', 'https://maps.app.goo.gl/qFz5nC6CDhBj3NcE9'),
  ('Chùa Từ Tân', '90/153 Trường Chinh, phường Bảy Hiền, TP. Hồ Chí Minh', null);

insert into public.events
  (slug, title, event_type, description, venue_id, start_date, end_date, lunar_text, capacity, registration_open, published)
values
  ('khoa-thien-thang-11-2026', 'Khóa thiền tháng 11', 'khoa_thien',
   'Dữ liệu mẫu. Cập nhật thời gian và nội dung theo thông báo chính thức của thiền tôn.',
   (select id from public.venues where name = 'Chùa Từ Tân'),
   '2026-11-06', '2026-11-08', null, 200, true, true),

  ('dai-le-phat-thanh-dao-2027', 'Đại lễ Phật Thành Đạo', 'dai_le',
   E'Thuyết giảng tối ngày 07 Âm lịch.\nLễ chính thức sáng ngày 08 Âm lịch.',
   (select id from public.venues where name = 'Chùa Phật Quang'),
   '2027-01-14', '2027-01-15', '07–08/12 AL', null, true, true),

  ('tet-nguyen-dan-2027', 'Tết Nguyên Đán', 'dai_le',
   E'Thuyết giảng đêm giao thừa.\nThuyết giảng sáng mùng 1 đến mùng 6.',
   (select id from public.venues where name = 'Chùa Phật Quang'),
   '2027-02-06', '2027-02-11', '1–6/1 AL', null, true, true),

  ('ram-thang-gieng-2027', 'Rằm tháng Giêng (cầu an đầu năm)', 'dai_le',
   E'Tụng kinh cầu Quốc Thái Dân An.\nThuyết giảng.',
   (select id from public.venues where name = 'Chùa Phật Quang'),
   '2027-02-20', '2027-02-20', '15/1 AL', null, true, true),

  ('dai-le-phat-dan-2027', 'Đại lễ Phật Đản', 'dai_le',
   E'Thuyết giảng tối ngày 14 Âm lịch.\nLễ chính thức sáng ngày 15 Âm lịch, có thuyết giảng.',
   (select id from public.venues where name = 'Chùa Phật Quang'),
   '2027-05-19', '2027-05-20', '14–15/4 AL', null, true, true),

  ('dai-le-vu-lan-2027', 'Đại lễ Vu Lan', 'dai_le',
   E'Thuyết giảng tối ngày 14 Âm lịch.\nLễ chính thức sáng ngày 15 Âm lịch, có thuyết giảng.',
   (select id from public.venues where name = 'Chùa Phật Quang'),
   '2027-08-15', '2027-08-16', '14–15/7 AL', null, true, true),

  ('ram-trung-thu-2027', 'Rằm Trung Thu và Lễ Trai đàn chẩn tế', 'dai_le',
   E'Lễ Trai đàn chẩn tế.\nVăn nghệ Trung Thu.',
   (select id from public.venues where name = 'Chùa Phật Quang'),
   '2027-09-15', '2027-09-15', '15/8 AL', null, true, true);
