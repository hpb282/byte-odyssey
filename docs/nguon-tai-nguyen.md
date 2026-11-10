# Nguồn tài nguyên

- Mẫu linh vật cam: ảnh tham chiếu người dùng cung cấp, được mô tả trong
  giai đoạn thiết kế là linh vật Claude Code. Tên trong game: **Linh vật**.
- Chín nhân vật còn lại, các bảng map, phác thảo UI và icon Robot Byte:
  các mẫu hình được tạo trong phiên thiết kế dự án và đã dùng làm tham chiếu.
- Sprite và hoạt cảnh thực tế: vẽ bằng mã tại `src/sprites.ts` và
  `src/scene.ts`, theo màu sắc và chủ đề đã duyệt. Các ảnh phác thảo không
  phải bộ khung hình hoạt ảnh runtime.
- Học liệu: tự biên soạn tại `src/questions.ts`.
- Hình gợi ý: ký tự emoji, do font hệ thống trên thiết bị hiển thị.
- Hiệu ứng âm thanh: tổng hợp bằng Web Audio API, không tải bản ghi ngoài.
- Font **Nunito** và **Press Start 2P**: lấy từ kho chính thức
  [google/fonts](https://github.com/google/fonts). File giấy phép SIL Open
  Font License đi kèm trong `public/fonts` và được đưa vào bản build.

Nguồn font:

- https://github.com/google/fonts/tree/main/ofl/nunito
- https://github.com/google/fonts/tree/main/ofl/pressstart2p

Mỗi tài nguyên và thư viện giữ điều kiện sử dụng tương ứng. Dự án chưa
chọn giấy phép phát hành mã nguồn chung (`UNLICENSED` trong package.json).
