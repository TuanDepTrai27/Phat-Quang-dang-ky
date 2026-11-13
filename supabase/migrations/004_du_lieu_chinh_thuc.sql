-- Cập nhật dữ liệu theo trang Lịch tu học và tin tức trên thientonphatquang.com (đối chiếu ngày 13/11/2026).
-- Chạy sau seed.sql và 001–003. Chạy lại nhiều lần không sao (chỉ dùng UPDATE).

-- Địa chỉ đầy đủ của Chùa Phật Quang
update public.venues
   set address = 'Núi Dinh, khu phố Chu Hải, phường Tân Hải, TP. Hồ Chí Minh'
 where name = 'Chùa Phật Quang';

-- Khóa thiền Từ Tân tháng 11: đã diễn ra từ chiều thứ Sáu 30/10 đến trưa Chủ nhật 01/11/2026
update public.events
   set title = 'Khóa thiền Từ Tân tháng 11',
       description = E'Khóa thiền 3 ngày tại Chùa Từ Tân, từ chiều thứ Sáu 30/10 đến trưa Chủ nhật 01/11/2026.\nTổng kết loạt bài giảng “Tứ Diệu Đế – Bản tuyên ngôn của Phật”.',
       start_date = '2026-10-30',
       end_date = '2026-11-01',
       registration_open = false
 where slug = 'khoa-thien-thang-11-2026';

-- Chương trình các đại lễ: bổ sung Lễ Quy Y Tam Bảo theo Lịch tu học chính thức
update public.events set description = E'Thuyết giảng tối ngày 07 Âm lịch.\nLễ chính thức sáng ngày 08 Âm lịch.\nLễ Quy Y Tam Bảo.'
 where slug = 'dai-le-phat-thanh-dao-2027';
update public.events set description = E'Thuyết giảng đêm giao thừa.\nThuyết giảng sáng mùng 1 đến mùng 6.\nLễ Quy Y Tam Bảo.'
 where slug = 'tet-nguyen-dan-2027';
update public.events set description = E'Lễ Quy Y Tam Bảo.\nTụng kinh cầu Quốc Thái Dân An.\nThuyết giảng.'
 where slug = 'ram-thang-gieng-2027';
update public.events set description = E'Thuyết giảng tối ngày 14 Âm lịch.\nLễ chính thức sáng ngày 15 Âm lịch, có thuyết giảng.\nLễ Quy Y Tam Bảo.'
 where slug in ('dai-le-phat-dan-2027', 'dai-le-vu-lan-2027');
update public.events set description = E'Lễ Quy Y Tam Bảo.\nLễ Trai đàn chẩn tế.\nVăn nghệ Trung Thu.'
 where slug = 'ram-trung-thu-2027';

-- Kiểm tra
select slug, title, start_date, end_date, registration_open from public.events order by start_date;
