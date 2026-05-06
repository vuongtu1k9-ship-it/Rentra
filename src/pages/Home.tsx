import { createSignal, For, createResource } from "solid-js";
import { Detail } from "./Detail";
import { Silver } from "./Silver";
import { Icon } from "solid-heroicons";
import { sparkles, magnifyingGlassCircle } from "solid-heroicons/solid";

const fetchps = async () => {
    const res = await fetch("/api/admin/products");
    if (!res.ok) return [];
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return [];
    const data = await res.json();
    return data.products || [];
};

export default function Home() {
    const [search, setSearch] = createSignal("");
    const [ps] = createResource(fetchps);

    const pList = () => {
        const list = ps()?.filter?.((p) => p.status) ?? [];
        const s = search().toLowerCase();
        if (!s) return list;
        return list.filter((p) => p.name?.toLowerCase().includes(s));
    };

    const addToCart = async (productId) => {
        const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const existing = cart.find((item) => item.goods === productId);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ goods: productId, quantity: 1 });
        }
        localStorage.setItem("cartItems", JSON.stringify(cart));
        alert("Đã thêm vào giỏ hàng!");
    };

    const sendComment = async (productId, comment) => {
        if (!comment?.trim()) {
            alert("Vui lòng nhập đánh giá!");
            return;
        }
        try {
            const res = await fetch(`/api/admin/products/${productId}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: comment }),
            });
            if (res.ok) {
                alert("Cảm ơn đã gửi đánh giá!");
            } else {
                alert("Không thể gửi đánh giá");
            }
        } catch (err) {
            alert("Lỗi khi gửi đánh giá");
        }
    };

    return (
        <div class="space-y-8">
            {/* Header */}
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h1 class="mb-2 text-3xl font-bold text-gray-800">Rentra</h1>
                <p class="text-gray-600">Khám phá các sản phẩm và bất động sản đang cho thuê quanh bạn!</p>
            </div>

            <div class="relative">
                <input type="search"
                    placeholder="Tìm kiếm sản phẩm..."
                    class="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 font-medium outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onInput={(e) => setSearch(e.target.value)} />
                <Icon path={magnifyingGlassCircle} class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <For
                    each={pList()}
                    fallback={
                        <div class="col-span-full py-12 text-center text-gray-400">
                            {ps.loading ? "Đang tải..." : "Không có sản phẩm nào"}
                        </div>
                    }
                >
                    {(p) => <Detail {...p} p={p} />}
                </For>
            </div>
            <Silver />
        </div>
    );
}
