# Học liệu tiếng Việt cho Byte Odyssey 0.1.0

120 bài tự biên soạn cho hoạt động nhận diện chữ, đọc từ quen thuộc và sắp
xếp câu ngắn ở lớp 2. Các chủ đề gồm trường học, gia đình, con vật, thiên
nhiên, đồ dùng, thức ăn và vui chơi. Không sử dụng bản ghi giọng nói.

| Nhóm | Số bài | Dạng bài |
| --- | ---: | --- |
| Nhận diện chữ | 40 | Chọn chữ/phụ âm còn thiếu theo cụm từ và hình gợi ý |
| Vần và dấu thanh | 40 | 20 bài ghép phần còn thiếu, 20 bài chọn tiếng phù hợp trong câu |
| Ghép từ và câu | 40 | 15 bài ghép từ, 15 bài xếp câu, 10 bài nối mỗi bộ 4 cặp từ–tranh |

## Ví dụ

- `_á cây` → **l** → lá cây.
- `con _é` → **ngh** → con nghé.
- `th + ?` với hình thuyền → **uyền** → thuyền.
- `Em uống một cốc __.` → **sữa**.
- `học + ?` → **sinh** → học sinh.
- `Em` / `đi` / `học.` → **Em đi học.**
- Nối **con mèo** với hình 🐱.

## Nguyên tắc

- Câu hỏi có ngữ cảnh cụ thể; không đánh đồng nhận dạng chính tả với đánh
  giá giọng nói hay phát âm vùng miền.
- Các mảnh câu có cụm từ, chữ hoa và dấu câu để học sinh sắp thành câu
  hoàn chỉnh, hạn chế những cách sắp khác nhau vẫn có thể đúng.
- Ở bài chọn, có ba phương án khác nhau và một đáp án chấm. Hệ thống
  chuẩn hóa Unicode NFC khi so sánh tiếng Việt.
- Khi sai, gợi ý giúp nhận ra chữ hoặc tiếng đích; sửa đúng vẫn nhận 5 điểm.
- Bài nối chỉ chấm khi đủ bốn cặp, không trừ tim cho thao tác chọn dở.
- Mỗi lượt lấy 10 bài không trùng. Nhóm vần/dấu có 5 bài mỗi dạng; nhóm
  từ/câu có 4 bài chọn, 3 bài xếp câu và 3 bài nối tranh.

## Xem và chỉnh học liệu

Trong ứng dụng: **Hướng dẫn → Bộ học liệu**, lọc theo nhóm hoặc tìm từ,
mở từng mục để xem đề, gợi ý và đáp án. Toàn bộ nội dung cũng ở
[hoc-lieu.json](hoc-lieu.json).

Chỉnh dữ liệu gốc ở [src/questions.ts](../src/questions.ts), rồi chạy:

```sh
node scripts/export-curriculum.mjs
npm test
npm run build
```

Khi tăng số lượng bài, cập nhật số liệu và kiểm thử tương ứng. Cần giữ ID
ổn định để lịch sử cũ còn đối chiếu được; lịch sử đã lưu vẫn giữ từ đích và
đáp án của lần chơi đó. Giáo viên nên rà soát ngữ cảnh khi bổ sung nội dung.

Học liệu được tự biên soạn cho dự án, không trích nguyên bài đọc có bản
quyền và không tự nhận là bộ đề được một cơ quan giáo dục phê duyệt.
