# Môi trường phát triển trên cloud

Dùng checkout có sẵn tại `/workspace/byte-odyssey`. Mỗi tác vụ cloud đã
được cách ly; không cần tạo Git worktree nếu người dùng không yêu cầu.

## Cài đặt và kiểm tra

Node.js 24 được ghim trong `.nvmrc`. `.npmrc` lưu bộ nhớ đệm npm bên trong
dự án để chạy được khi thư mục người dùng chỉ có quyền đọc.

```bash
cd /workspace/byte-odyssey
npm ci
npm run build
npm test
```

Khởi động lại server sau khi mở một máy cloud mới; không giả định tiến
trình từ phiên trước vẫn tồn tại:

```bash
npm run dev -- --port 5173
```

Trong một terminal khác, `curl -fsS http://127.0.0.1:5173/` phải trả về
HTML của ứng dụng. Dừng server bằng Ctrl+C khi không dùng nữa.

`npm run test:e2e` tự khởi động bản preview production ở cổng 4173.
Playwright ưu tiên Chromium có sẵn tại `/usr/bin/chromium`; cũng có thể
chỉ định đường dẫn bằng `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Nếu máy
chưa có trình duyệt, cài Chromium theo hướng dẫn của Playwright và giữ
nguyên kiểm tra TLS/chữ ký tải xuống.

## Kiểm tra desktop Linux

Khi môi trường dùng proxy và không cho ghi vào thư mục người dùng:

```bash
cd /workspace/byte-odyssey
export electron_config_cache="$PWD/.cache/electron"
export ELECTRON_GET_USE_PROXY=1
export GLOBAL_AGENT_HTTP_PROXY="$HTTP_PROXY"
export GLOBAL_AGENT_HTTPS_PROXY="$HTTPS_PROXY"
npm run install:desktop
npm run build
ELECTRON_BUILDER_CACHE="$PWD/.cache/electron-builder" \
  npx electron-builder --dir --config.electronDist=node_modules/electron/dist
node scripts/smoke-desktop.mjs release/linux-unpacked/byte-odyssey
```

Các biến proxy ở trên tham chiếu cấu hình có sẵn của nền tảng, không
chứa thông tin xác thực cố định. Script smoke dùng hồ sơ tạm riêng, kiểm
tra vào game, đóng/mở lại ứng dụng và phục hồi dữ liệu rồi xóa hồ sơ thử.
Việc kiểm tra Linux không thay cho kiểm tra Windows trong GitHub Actions.

Git sử dụng kết nối HTTPS được nền tảng cấp. Không cần tự chép token vào
dự án. Ứng dụng không cần khóa API, microphone hay cơ sở dữ liệu bên ngoài.

Các lệnh trên đã chạy thành công trong máy phát triển hiện tại. Có thể
dùng chúng để tái lập quy trình trên máy cloud mới.
