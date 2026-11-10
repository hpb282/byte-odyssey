# Cập nhật Byte Odyssey trong ứng dụng

Từ 0.2.0, bản cài **Setup Windows 10/11 x64** tự kiểm tra bản mới sau khi
mở khoảng 5 giây và có Internet. Có thể kiểm tra thủ công tại **Cài đặt →
Cập nhật ứng dụng**. Không cần tài khoản GitHub hay máy chủ riêng.

Nếu có bản mới, app hiện phiên bản và nội dung thay đổi. Thông báo tự động
chờ đến khi người dùng ra khỏi game, không cắt ngang câu hỏi. **Cập nhật
ngay** cho phép tải, lưu dữ liệu, cài đặt và mở lại app. Tiến độ tải hiển
thị trong cửa sổ cập nhật. **Để sau** đóng thông báo trong phiên đang mở;
nếu đang tải thì tệp vẫn tiếp tục tải nhưng không tự cài nữa. Người dùng
có thể quay lại cửa sổ cập nhật để chọn **Lưu và cài đặt bản mới**.

Mất mạng hoặc tải lỗi không chặn việc chơi game. Có nút thử lại. Không tự
tải trước khi người dùng đồng ý, không tự cài khi đóng app bình thường,
không nhận bản thử nghiệm hoặc hạ phiên bản. Dùng HTTPS của GitHub và kiểm
tra SHA-512 của bộ cài qua electron-updater; giữ mặc định xác minh của thư
viện. Bản hiện tại chưa có chứng chỉ ký số nhà phát hành.

App giữ nguyên `appId`, tên sản phẩm, thư mục userData và hai khóa lưu trữ
`byte-odyssey:data:v1`, `byte-odyssey:active:v1`. Trước khi cài, renderer
lưu dữ liệu và main process yêu cầu Electron ghi bộ nhớ lưu trữ ra đĩa.
Không xóa hồ sơ, bảng điểm hoặc lượt đang chơi trong quá trình cập nhật.

**Bản 0.1.x cần cài Setup 0.2.0 một lần.** Sau đó các lần cập nhật dùng
nút trong app. Portable, bản chạy phát triển và các nền tảng khác hiển thị
nút mở trang phát hành để tải thủ công. Bản web giữ cơ chế service worker
riêng, không tải hay chạy file EXE.

## Phát hành bản tiếp theo

1. Tăng phiên bản trong `package.json` và lockfile bằng `npm version
   <phiên-bản> --no-git-tag-version`; cập nhật `docs/release-notes.md`.
2. Chạy kiểm tra, commit, push main; tạo tag tương ứng, ví dụ `v0.3.0`.
3. Workflow build và kiểm tra cả web lẫn Windows; dùng gh trong runner để
   xuất bản GitHub Release sau khi các bước đạt.
4. Giữ đủ file `Setup-x64.exe`, `.exe.blockmap` và `latest.yml` do cùng
   một lần build tạo ra. Metadata chứa phiên bản, đường dẫn, kích thước và
   SHA-512; không sửa checksum bằng tay. Workflow cũng xuất bản Portable,
   Web.zip và SHA256SUMS.txt.

Cấu hình provider được đóng gói trong `resources/app-update.yml` trỏ tới
repository công khai `hpb282/byte-odyssey`. Không nhúng token vào app.
`--publish never` chỉ tắt thao tác tự đăng của electron-builder; metadata
cập nhật vẫn được tạo và bước phát hành riêng tải các file lên GitHub.

## Kiểm chứng

- 7 bài kiểm tra controller: đồng ý tải/cài, lỗi mạng, checksum lỗi, thử lại,
  yêu cầu trùng nhau, nền tảng không hỗ trợ và phiên bản mới nhất.
- 5 bài Playwright với bridge giả lập: thông báo, nội dung an toàn, Để sau,
  một lần đồng ý tải/cài, lỗi và không chen vào game.
- `smoke-desktop.mjs` chạy ứng dụng Electron thật, làm đúng một câu để
  nhận 10 điểm, đóng/mở lại và so sánh hồ sơ, điểm, các lần trả lời cùng
  lượt đang chơi. Tham số thứ ba cho phép thay gói cũ bằng gói mới ngay
  tại cùng đường dẫn để kiểm tra giữ dữ liệu giữa hai phiên bản.
- `smoke-updater.mjs` chạy trên Windows: đọc metadata do build tạo,
  cung cấp qua server localhost, nhận diện một phiên bản thử cao hơn, tải
  bộ NSIS thật, xác minh SHA-512 qua thư viện và kiểm tra yêu cầu cài/mở
  lại sau khi lưu hồ sơ. Chỉ thao tác bàn giao cho bộ cài hệ điều hành được
  thay bằng spy; bài này không tự chạy trình cài vào Windows của runner.

Kiểm thử không tự đăng phiên bản thử hoặc thay provider trong bản phát
hành. Provider localhost chỉ được thiết lập trong bộ kiểm tra bằng kết
nối kiểm thử Electron của Playwright.
