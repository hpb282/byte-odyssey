# Kiến trúc phiên bản 0.1.1

## Thành phần

- React + TypeScript + Vite cho giao diện và luồng lựa chọn.
- Canvas 2D cho 4 hoạt cảnh; sprite pixel của 10 nhân vật được dùng chung
  giữa hình SVG trong menu và hình vẽ trong game.
- Electron cho ứng dụng desktop. Renderer không dùng Node.js, bật
  `contextIsolation` và `sandbox`; chỉ mở giao diện đã đóng gói, không cấp
  quyền micro hoặc camera và không cho cửa sổ mới.
- Không có máy chủ, tài khoản mạng hoặc khóa API cần cấu hình.

| Tệp | Vai trò |
| --- | --- |
| `src/questions.ts` | 120 bài, gợi ý, bộ lấy 10 câu không lặp |
| `src/engine.ts` | Chấm bài, tim, điểm, chuyển câu, kết thúc; không phụ thuộc map |
| `src/catalog.ts` | Nhóm học, 4 game, 10 nhân vật, 23 map và bảng màu |
| `src/scene.ts` | Cùng bố trí vật cản, thay nền và ngoại hình theo map |
| `src/storage.ts` | Lưu, kiểm tra và hợp nhất hồ sơ, xuất JSON/CSV |
| `src/App.tsx` | Điều phối màn hình, tạm dừng, hồ sơ và phục hồi lượt |
| `electron/main.cjs` | Cửa sổ desktop và vùng dữ liệu người dùng |
| `scripts/build-offline.mjs` | Tạo service worker và danh sách tài nguyên tĩnh |

## Trạng thái lượt chơi

`answer → correct → (advance) → answer/completed` hoặc
`answer → wrong → retry → answer`; sai khi hết tim chuyển `lost`.
Thoát có xác nhận chuyển `abandoned`. Hoạt ảnh chỉ chạy sau khi chấm đúng;
đổi map hoặc nhân vật không thay luật và điểm.

Không chấm khi câu trả lời chưa đủ. Khi đang phản hồi/hoạt ảnh, thao tác
xác nhận tiếp bị chặn để không cộng điểm hay trừ tim hai lần.

## Dữ liệu

- `byte-odyssey:data:v1` trong localStorage: hồ sơ, lớp, cài đặt và kết quả.
- `byte-odyssey:active:v1`: lượt đang chơi, phục hồi sau khi mở lại.
- Mỗi lượt kết thúc có UUID; ghi lại cùng ID không tạo bản ghi trùng.
- Nhập JSON kiểm tra phiên bản, cấu trúc, tham chiếu hồ sơ và game/map.
  Hợp nhất theo ID, không xóa kết quả hiện có. File tối đa 10 MB.
- Nếu gặp dữ liệu cũ không đọc được, giữ bản phục hồi trước khi ghi dữ liệu
  mới; nếu không ghi được thì báo để người dùng xuất bản sao lưu.
- Thống kê tính từ các lần xác nhận, không đánh giá tốc độ đọc hoặc phát âm.

## Đóng gói

Build Vite dùng đường dẫn tương đối để chạy được trong bản Electron. Font,
icon và học liệu được đóng gói sẵn. Web cần HTTP(S); service worker lưu tài
nguyên cùng nguồn sau lần tải đầy đủ đầu tiên. Desktop tải từ tệp trong
gói nên không cần kết nối mạng để chơi.

GitHub Actions chạy kiểm thử web trước khi build NSIS và portable trên
Windows, thử mở bản đóng gói, rồi tải các tệp lên Release khi push tag.
Kho mã nguồn không chứa `node_modules`, cache hoặc các file bộ cài lớn.
