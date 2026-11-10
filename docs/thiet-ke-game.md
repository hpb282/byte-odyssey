# Byte Odyssey — Thiết kế game

## Trạng thái triển khai

Đã xây dựng phiên bản 0.1.0 bằng React, TypeScript và Canvas: đủ 4 game,
10 nhân vật, 23 map, 120 bài tự biên soạn, luồng chọn đã duyệt, hồ sơ,
thống kê, sao lưu và phục hồi lượt đang chơi. Có vỏ ứng dụng Electron,
icon, cấu hình bộ cài Windows và workflow GitHub Actions tạo bản phát hành.

Xem [README](../README.md) để chạy và tải bản build. Các ảnh thiết kế trong
tài liệu là phác thảo tham chiếu; đồ họa runtime được dựng bằng mã.

## Mục tiêu đã chốt

Game giáo dục dành cho học sinh lớp 2, tập trung vào luyện nhận diện chữ
tiếng Việt thông qua bài tập ghép và nối.

Mục tiêu này thay thế mục tiêu sửa lỗi phát âm trước đây. Game không ghi âm,
nhận dạng giọng nói hoặc tự đánh giá phát âm. Kết quả phản ánh khả năng làm bài
nhận diện, ghép và nối chữ; không phải điểm phát âm.

## Nội dung luyện tập

Ba nhóm nội dung được điều chỉnh theo hướng tương tác đã thống nhất:

1. **Nhận diện chữ và phụ âm:** chọn, phân biệt hoặc ghép chữ để hoàn thành
   tiếng, từ; có thể dùng tranh làm gợi ý.
2. **Ghép vần và nhận diện dấu thanh:** ghép các phần thành tiếng, chọn dấu
   thanh phù hợp với từ và ngữ cảnh minh họa.
3. **Ghép từ và câu:** ghép tiếng thành từ, nối từ với tranh và sắp xếp từ
   thành câu ngắn.

Học sinh và giáo viên được tự chọn nhóm nội dung và game, không bắt buộc theo
thứ tự. Nối chuỗi từ là ý tưởng nâng cao, chưa thuộc phần thiết kế đã chốt.

## Bốn game

Phạm vi dự án đã chốt gồm 4 game:

| Game | Bối cảnh | Số map |
| --- | --- | --- |
| Đường chạy phiêu lưu | Chạy và vượt chướng ngại vật | 5 |
| [Phi thuyền không gian](game-2-phi-thuyen.md) | Bắn thiên thạch để mở đường | 6 |
| [Đường đua kỳ thú](game-3-duong-dua.md) | Đua xe qua các trạm thử thách | 6 |
| [Leo núi tìm sao](game-4-leo-nui.md) | Leo các bậc để đến đỉnh núi | 6 |

Cả bốn game dùng kết quả bài tập ghép/nối để kích hoạt hành động, dùng chung
10 nhân vật và ba nhóm nội dung luyện tập. Tổng cộng có 23 map theo thiết kế.
Học sinh và giáo viên được chọn game, nhân vật và map trước khi chơi.

## Màn hình chính và luồng chọn

Luồng: **Màn hình chính → Chọn nội dung → Chọn game → Chọn nhân vật →
Chọn map → Chơi**.

Theo yêu cầu của người dùng, [thiết kế và duyệt từng màn hình](luong-chon-va-man-hinh.md).
Mỗi bước gửi đề xuất và ảnh, hỏi có đồng ý không và cần sửa chỗ nào; chỉ
chuyển sang bước tiếp theo sau khi người dùng duyệt. Toàn bộ 5 màn hình:
màn hình chính, chọn nội dung, chọn game, chọn nhân vật và chọn map đã
được duyệt ở mức thiết kế, gồm cả trường hợp hiển thị 5 và 6 map.

## Icon ứng dụng

Đã dùng [icon Robot Byte](icon-ung-dung.md) cho ứng dụng, gồm PNG nền trong
suốt và ICO nhiều kích thước. Icon được cấu hình trong cửa sổ Electron,
ứng dụng web và bộ cài/lối tắt Windows.

## Cách trình bày mỗi game

Theo yêu cầu của người dùng, mỗi lượt thiết kế game tiếp theo cần gửi kèm:

1. Luật chơi, luồng tương tác, tính điểm và điều kiện kết thúc.
2. Ảnh phác thảo màn hình chơi.
3. Bảng ảnh nhiều map khác nhau, đánh số và đặt tên để người dùng chọn.

Chủ động gửi các map cùng lượt thiết kế, không đợi người dùng hỏi thêm.
Thông thường chuẩn bị 6 phương án; danh sách được duyệt phụ thuộc lựa chọn
của người dùng. Map trong cùng game chỉ thay hình ảnh, giữ nguyên luật chơi,
độ khó và cơ chế chướng ngại vật.

## Mười nhân vật được chọn khi chơi

1. Linh vật (nhân vật cam theo ảnh tham chiếu do người dùng cung cấp).
2. Robot Byte.
3. Mèo.
4. Thỏ.
5. Gấu.
6. Cáo.
7. Ếch.
8. Chim cánh cụt.
9. Mầm.
10. Sao.

Nhân vật dùng phong cách pixel. Trong Đường chạy phiêu lưu, các nhân vật có
cùng khả năng; lựa chọn nhân vật không thay đổi độ khó bài tập.

## Game 1: Đường chạy phiêu lưu

### Bối cảnh

Game 1 có [5 map đã chốt](game-1-maps.md): Rừng xanh, Vườn kẹo, Đảo mây,
Sa mạc nắng và Thung lũng băng, cùng phong cách pixel với bộ nhân vật.
Học sinh hoặc giáo viên tự chọn map trước khi bắt đầu mỗi lượt chơi.
Cả 5 map được chọn ngay từ đầu, không bắt buộc theo thứ tự hoặc cần mở khóa.

Map chỉ tạo sự mới mẻ về hình ảnh: cảnh nền và ngoại hình chướng ngại vật
thay đổi theo chủ đề. Cả 5 map dùng chung luật chơi, độ khó và bộ chướng ngại
vật. Với cùng cấu hình màn, vật cản có cùng số lượng, thứ tự, vị trí, khoảng
cách, kích thước va chạm và hành vi; tốc độ chạy và cách nhảy cũng giống nhau.
Nội dung bài tập phụ thuộc nhóm luyện tập được chọn, không phụ thuộc map.

### Chuẩn bị lượt chơi

Vào Game 1 → chọn nội dung luyện tập, nhân vật và map → bấm **Bắt đầu**.
Mỗi lượt dùng một map xuyên suốt 10 thử thách. Khi chơi lượt mới, có thể
quay lại màn chuẩn bị để chọn map khác.

### Luồng chơi

1. Nhân vật tự chạy đến điểm chờ an toàn trước chướng ngại vật.
2. Game hiện bài tập theo nhóm nội dung đã chọn.
3. Học sinh ghép, nối hoặc bấm chọn đáp án.
4. Đáp án đúng khiến nhân vật nhảy qua chướng ngại vật và nhận điểm.
5. Đáp án sai khiến nhân vật đứng lại, mất một trái tim và nhận gợi ý để thử lại.

Chướng ngại vật chờ trong lúc học sinh làm bài. Cơ chế ghi âm và các trạng
thái nghe, xử lý giọng nói trong thiết kế cũ được thay bằng phần bài tập này.

### Lượt chơi và điểm

- Một màn gồm 10 thử thách và bắt đầu với 3 trái tim.
- Đúng ngay lần đầu: 10 điểm cho thử thách đó.
- Đúng sau khi đã trả lời sai và nhận gợi ý: 5 điểm cho thử thách đó.
- Mỗi thử thách chỉ được cộng điểm một lần.
- Vượt đủ 10 thử thách: hoàn thành màn.
- Hết trái tim: kết thúc màn, cho phép thử lại.

### Màn hình

- Phía trên: tên học sinh, điểm, trái tim và tiến trình làm bài.
- Ở giữa: nhân vật, đường chạy và chướng ngại vật.
- Khu vực bài tập: chữ tiếng Việt lớn, rõ dấu; tranh và các mảnh ghép hoặc
  lựa chọn cần thiết.
- Có nút tạm dừng và phản hồi ngắn, dễ hiểu khi làm đúng hoặc cần thử lại.

### Kết quả và hồ sơ

Cuối màn hiển thị điểm, số thử thách hoàn thành, các mục làm đúng và các mục
cần luyện thêm. Lưu kết quả theo hồ sơ học sinh để giáo viên theo dõi.
Thông tin kết quả gồm thời điểm chơi, game, map, nhóm nội dung, nhân vật, điểm,
tiến trình và kết quả các bài tập. Cách lưu và đồng bộ hồ sơ sẽ được chọn
khi thiết kế phần kỹ thuật.

## Hướng phát triển tiếp

- Giáo viên rà soát và bổ sung ngữ liệu theo hoạt động thực tế của lớp.
- Tiếp tục tinh chỉnh đồ họa và hoạt ảnh từ phản hồi chơi thử.
- Đồng bộ hồ sơ giữa thiết bị hoặc âm thanh nghe mẫu là những mở rộng chưa
  thuộc bản 0.1.0; bản hiện tại lưu tại máy và có sao lưu/chuyển máy bằng JSON.
