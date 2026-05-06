import { createSignal } from "solid-js";

export const Detail = ({
    name,
    imageUrl,
    imgId,
    seller,
    owner,
    description,
    price,
    category,
    status,
    p,
    videoUrl,
    _id,
    id,
}) => {
    const formatVN = (n) => n?.toLocaleString?.("vi-VN") ?? 0;
    const productId = () => _id || id || p?.id;

    const [comment, setComment] = createSignal("");
    const MAX_CHARS = 160;

    const charCount = () => comment().length;
    const isOverLimit = () => charCount() > MAX_CHARS;

    const handleComment = () => {
        if (!comment().trim()) {
            alert("Vui lòng nhập đánh giá!");
            return;
        }
        if (isOverLimit()) {
            alert(`Tối đa ${MAX_CHARS} ký tự!`);
            return;
        }
        fetch(`/api/admin/products/${productId()}/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: comment() }),
        }).then((res) => {
            if (res.ok) {
                alert("Cảm ơn đã gửi đánh giá!");
                setComment("");
            } else {
                alert("Không thể gửi đánh giá");
            }
        });
    };

    const addToCart = () => {
        const pid = productId();
        if (!pid) {
            alert("Lỗi: Không tìm thấy ID sản phẩm!");
            console.log("Props:", { _id, id, p: p?.id });
            return;
        }
        console.log("Adding to cart, productId:", pid);

        // Lưu localStorage
        const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const existing = cart.find((item) => item.goods === pid);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ goods: pid, quantity: 1 });
        }
        localStorage.setItem("cartItems", JSON.stringify(cart));

        alert(`Đã thêm vào giỏ! (ID: ${pid})`);
    };

    return (
        <div class="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div class="relative aspect-square overflow-hidden bg-gray-100">
                <p className="p-1 text-xs">
                    <strong>Người bán: </strong>
                    {seller || owner || "Ẩn danh"}
                </p>
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        class="h-full w-full object-cover"
                        onMouseOver={(e) => e.target.play()}
                        onMouseOut={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                        }}
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        src={imageUrl || p?.imageUrl || p?.img?.link || "/no-image.png"}
                        alt={name || p?.name}
                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
            </div>
            <div class="space-y-2 p-4">
                <h3 class="line-clamp-1 font-bold text-gray-800">
                    {name || p?.name || "Sản phẩm"}
                </h3>
                <p class="line-clamp-2 text-xs text-gray-400">
                    {description || p?.description || ""}
                </p>
                <div class="flex items-center justify-between">
                    <p class="text-lg font-bold text-blue-600">{formatVN(price || p?.price)}₫</p>
                    <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                        {category || p?.category || "Chưa phân loại"}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <span className={status ? "text-xs text-green-600" : "text-xs text-red-600"}>
                        {status ? "Còn hàng" : "Hết hàng"}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={addToCart}
                        className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Thêm vào giỏ
                    </button>
                </div>

                {/* Comment Section */}
                <div className="mt-2 border-t pt-2">
                    <textarea
                        value={comment()}
                        onInput={(e) => setComment(e.target.value)}
                        placeholder="Nhập đánh giá..."
                        className="w-full resize-none rounded-lg border p-2 text-xs"
                        rows={2}
                    />
                    <div className="mt-1 flex items-center justify-between">
                        <span
                            className={`text-xs ${isOverLimit() ? "text-red-500" : "text-gray-400"}`}
                        >
                            {charCount()} / {MAX_CHARS} ký tự
                        </span>
                        <button
                            onClick={handleComment}
                            disabled={isOverLimit()}
                            className="rounded bg-gray-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                        >
                            Gửi đánh giá
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
