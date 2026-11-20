# Moonlit Bloom

Thiệp tri ân 20/11 kèm bức tranh động bằng HTML và Canvas. Mở `index.html` trực tiếp; không cần cài thư viện hoặc chạy build. Khi chép sang nơi khác, giữ kèm `gift.config.js` và các thư mục `css/`, `js/`.

## Điền thông tin món quà

Mở **`gift.config.js`** ở thư mục gốc và điền ba trường đầu:

```js
website: "https://dia-chi-trang-web-cua-ban",
username: "tai-khoan-tang-co",
password: "mat-khau-tang-co",
```

Có thể sửa `senderName`, `title` và sáu đoạn trong `messages`. Các trường tài khoản, mật khẩu được để trống sẵn để bạn tự điền; đây là nội dung hiển thị cho người nhận thiệp.

Khi mở trang, cô đọc từng lời nhắn bằng **Tiếp tục** (hoặc phím mũi tên). Sau lời nhắn thứ sáu là phần địa chỉ website, tài khoản và mật khẩu. Nút **Hiện** bật/tắt phần che mật khẩu; **Truy cập website** xuất hiện khi đã điền địa chỉ hợp lệ. Bấm **Ngắm bức tranh** để bắt đầu cảnh động. Nút **Lời gửi cô** cho phép mở lại thiệp.

Cảnh được tạm dừng trong lúc đọc thiệp; khi mở lại thiệp giữa chừng, cảnh tiếp tục từ vị trí đã dừng.

## Cấu trúc

| Tệp | Nội dung |
| --- | --- |
| `gift.config.js` | Lời tri ân, tên người gửi, địa chỉ website, tài khoản và mật khẩu |
| `css/gift.css` | Giao diện thiệp và thẻ thông tin món quà |
| `js/gift.js` | Chuyển lời nhắn, đọc cấu hình, mở món quà và che/hiện mật khẩu |
| `index.html` | Khung trang, gradient SVG dùng tạo ảnh và thứ tự nạp mã |
| `css/styles.css` | Giao diện, toàn màn hình, ẩn điều khiển |
| `js/config.js` | Cấu hình nhóm 5 học sinh, màu cặp và thời lượng từng chặng |
| `js/core.js` | Trạng thái dùng chung, canvas, dữ liệu cảnh cố định |
| `js/flowers.js` | Tạo cây hoa, nở hoa và vẽ cây bằng Canvas |
| `js/scenery.js` | Bố cục, bờ hồ, đảo, cầu, cỏ, đom đóm và các lớp cảnh |
| `js/props.js` | Xích đu, thuyền neo và chuyển động của chúng |
| `js/maple.js` | Cây phong, tổ chim, chim non và chim bay về tổ |
| `js/characters.js` | Cô giáo, 5 học sinh, đường đi, nắm tay và vui chơi |
| `js/environment.js` | Gió, hạt sáng, cánh hoa và gợn nước |
| `js/main.js` | Vòng vẽ duy nhất, khởi tạo và thao tác người dùng |

Các tệp JavaScript được nạp bằng `defer` theo thứ tự trong HTML, để vẫn dùng được khi mở bằng `file://`.

## Chuyến đi của lớp

Cô giáo và **5 học sinh** giữ nguyên danh tính trong cả vòng lặp:

1. Nắm tay đi qua cầu: 44 giây.
2. Tản ra trên đảo: 6 giây.
3. Vui chơi: 36 giây. Một em chơi xích đu, một em đẩy, hai em chuyền bóng và một em ngắm đom đóm; cô giáo đứng trông gần đó.
4. Tập hợp: 8 giây.
5. Nắm tay đi về bờ: 44 giây.
6. Nghỉ và xếp hàng cho vòng tiếp theo: 16 giây.

Thay đổi thời gian ở `TRIP_CONFIG.stages` trong `js/config.js`. Khi mở trang, chuyến đi đã bắt đầu được 12 giây để hàng học sinh xuất hiện ngay trên cầu.

## Điều khiển

- `F`: bật/tắt toàn màn hình.
- `H`: ẩn/hiện nút điều khiển.
- Rê ngang chuột hoặc bấm **Tạo gió**: tác động vào gió.
- **Nở lại**: phát lại phần nở hoa.

Cảnh tĩnh được lưu trong canvas đệm; các nhân vật dùng chung một đồng hồ chuyến đi, và toàn cảnh dùng một vòng `requestAnimationFrame`. Chế độ giảm chuyển động của hệ điều hành được tôn trọng.
