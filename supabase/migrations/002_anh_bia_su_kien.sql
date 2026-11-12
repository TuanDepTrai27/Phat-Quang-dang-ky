-- Gắn ảnh bìa cho các sự kiện mẫu (ảnh lấy từ website và kho ảnh của Thiền Tôn Phật Quang).
-- Cần chạy 001_anh_bia.sql trước. Chạy một lần: Supabase > SQL Editor > New query > dán > Run.
-- Ảnh nào không hiện thì admin vào sửa sự kiện và dán link ảnh khác.
update public.events set cover_url = v.url
from (values
  ('khoa-thien-thang-11-2026',   'https://ttpqassets.thientonphatquang.com/news/1794018558245-0y45nb.jpg'),
  ('dai-le-phat-thanh-dao-2027', 'https://wpassets.thientonphatquang.com/2024/01/7-2-1-scaled.jpg'),
  ('tet-nguyen-dan-2027',        'https://wpassets.thientonphatquang.com/2023/01/8.-Ben-ngoai-13-8-scaled.jpg'),
  ('ram-thang-gieng-2027',       'https://wpassets.thientonphatquang.com/2023/02/1-2-7-scaled.jpg'),
  ('dai-le-phat-dan-2027',       'https://wpassets.thientonphatquang.com/2023/06/0.0-21-scaled.jpg'),
  ('dai-le-vu-lan-2027',         'https://ttpqassets.thientonphatquang.com/news/1788082530209-2ibbiq.jpg'),
  ('ram-trung-thu-2027',         'https://ttpqassets.thientonphatquang.com/banners/1790088940251-4sxk89.png')
) as v(slug, url)
where events.slug = v.slug;

-- Kiểm tra: 7 dòng có cover_url
select slug, cover_url is not null as co_anh from public.events order by start_date;
