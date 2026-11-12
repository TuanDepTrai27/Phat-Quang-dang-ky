import type { Config } from "tailwindcss";

// Bảng màu lấy theo website chính thientonphatquang.com (nâu trầm, vàng đồng, nền kem).
// Giữ tên cũ (pine, saffron...) để các trang khác tự đổi màu theo, không phải sửa từng file.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mist: "#FAF6EE",      // nền: kem
        beige: "#F0E9D8",     // nền khối nhấn (lịch tu học)
        paper: "#FFFFFF",     // bề mặt thẻ
        ink: "#2E1A0E",       // chữ chính: nâu đậm
        muted: "#7B6656",     // chữ phụ
        line: "#E6DCC8",      // đường kẻ
        pine: "#2E1A0E",      // màu chính: nâu đậm (header, tiêu đề)
        "pine-soft": "#4A2F1B",
        bark: "#8A572C",      // nền footer
        saffron: "#C4952A",   // vàng đồng
        "saffron-dark": "#A87C1F",
        "saffron-ink": "#8A6416", // chữ vàng trên nền sáng (đủ tương phản)
        "saffron-light": "#E7C978",
        lotus: "#8A3B22",     // cảnh báo / hết chỗ
        leaf: "#3F5F24",      // trạng thái đang mở
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
        serif: ['"Noto Serif"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
