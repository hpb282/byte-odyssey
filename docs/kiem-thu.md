# Kiểm tra phiên bản 0.1.1

Các kiểm tra đã thực hiện trong môi trường phát triển Linux:

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript và build Vite | Thành công |
| Định dạng Prettier | Thành công |
| Kiểm thử logic Vitest | 18 bài đạt, 2 tệp |
| Kiểm thử trình duyệt Playwright/Chromium | 10 bài đạt |
| Dependency production qua npm audit | Không phát hiện lỗ hổng |
| Đóng gói Electron Linux dạng thư mục | Thành công |
| Chạy thử ứng dụng desktop đã đóng gói | Mở, chọn đủ luồng, vào game, lưu hồ sơ và phục hồi sau khi mở lại thành công |
| JSON học liệu | Khớp đủ 120 bài trong mã runtime |

## Các luồng trình duyệt đã kiểm tra

- Chơi đủ 10 câu trong cả 4 game; đúng nhân vật, map và hồ sơ, nhận 100 điểm.
- Ghép câu và nối tranh trong nhóm từ/câu.
- Sai rồi sửa đúng nhận 5 điểm cho câu đó, tổng lượt 95 điểm.
- Ba lần sai kết thúc lượt; chơi lại phục hồi đủ ba tim.
- Chờ làm bài không tự mất tim; tạm dừng và quay về lưu trạng thái dừng giữa chừng.
- Tải lại trang giữ lượt đang chơi và điểm đã đạt.
- Xuất, nhập lại JSON; file không hợp lệ bị từ chối và dữ liệu cũ vẫn giữ.
- Màn hình 390 × 844 chơi được, không tràn ngang.
- Tải đầy đủ bản web rồi ngắt mạng vẫn mở và làm bài được.

## Phạm vi kiểm tra desktop

Đã kiểm tra bản Electron Linux thật từ tệp đóng gói, không chỉ chạy server
phát triển. Trình kiểm tra dùng một thư mục dữ liệu học sinh thử riêng và
xóa sau khi xong. Ảnh chạy thật nằm ở [screenshots](screenshots).

Bộ cài Windows được tạo và chạy thử bản ứng dụng đóng gói trong job
`windows` của [workflow](../.github/workflows/build.yml), trên máy Windows
của GitHub Actions. Kết quả job và các tệp tải được hiển thị tại Actions/
Releases sau khi workflow hoàn thành; không suy ra kết quả Windows chỉ từ
kiểm tra Linux.
