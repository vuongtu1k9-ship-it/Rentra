import { For, Show, createSignal } from "solid-js";
import { shoppingCart } from "solid-heroicons/solid";

const formatVN = new Intl.NumberFormat("vi-VN");

export const Cart = ({
    items = [],
    fullName,
    address,
    phone,
    handleChangeQty,
    handleRemove,
    handleSubmit,
    isAdmin,
    isUser,
    profile,
}) => {
    // Luồng thanh toán: 1 (Cart), 2 (Checkout Info), 3 (Review)
    const [step, setStep] = createSignal(1);

    // Lưu thông tin giao hàng cục bộ giữa các bước
    const [shippingInfo, setShippingInfo] = createSignal({
        fullName: fullName || profile?.fullName || "",
        phone: phone || profile?.phone || "",
        address: address || profile?.address || "",
    });

    const subtotal = () =>
        items.reduce((sum, i) => sum + Number(i.price || 0) * (i.quantity || 1), 0);
    const shippingFee = () => Math.min(Math.round(subtotal() * 0.05), 50000);
    const total = () => subtotal() + shippingFee();

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setShippingInfo({
            fullName: formData.get("fullName"),
            phone: formData.get("phone"),
            address: formData.get("address"),
        });
        setStep(3); // Go to review
    };

    const finalSubmit = () => {
        // Mock a submit event or pass the data directly if needed.
        // Assuming props.handleSubmit expects a FormData-like event or we can construct it.
        // Since original form used onSubmit, we simulate or pass data.
        if (typeof handleSubmit === "function") {
            // Passing the compiled shipping info back
            const fakeEvent = {
                preventDefault: () => {},
                currentTarget: {
                    elements: {
                        fullName: { value: shippingInfo().fullName },
                        phone: { value: shippingInfo().phone },
                        address: { value: shippingInfo().address },
                    },
                },
                shippingInfo: shippingInfo(),
            };
            handleSubmit(fakeEvent);
        }
    };

    return (
        <Show
            when={items?.length > 0}
            fallback={
                <div class="rounded-2xl border bg-white p-12 text-center">
                    <div class="mb-4 flex justify-center">
                        <shoppingCart class="h-16 w-16 text-gray-300" />
                    </div>
                    <h1 class="mb-2 text-2xl font-bold text-gray-800">Giỏ Hàng</h1>
                    <p class="text-gray-500">Giỏ hàng của bạn đang trống.</p>
                    <a
                        href="/"
                        class="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                    >
                        Tiếp tục mua sắm
                    </a>
                </div>
            }
        >
            <article class="space-y-6 rounded-2xl border bg-white p-6">
                {/* Stepper Indicator */}
                <div class="mb-6 flex items-center justify-center space-x-4">
                    <div
                        class={`rounded-full px-4 py-2 text-sm font-bold ${step() >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                        1. Giỏ hàng
                    </div>
                    <div class="h-1 w-8 bg-gray-200">
                        <div class={`h-full ${step() >= 2 ? "bg-blue-600" : ""}`}></div>
                    </div>
                    <div
                        class={`rounded-full px-4 py-2 text-sm font-bold ${step() >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                        2. Thông tin
                    </div>
                    <div class="h-1 w-8 bg-gray-200">
                        <div class={`h-full ${step() >= 3 ? "bg-blue-600" : ""}`}></div>
                    </div>
                    <div
                        class={`rounded-full px-4 py-2 text-sm font-bold ${step() >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                        3. Xác nhận
                    </div>
                </div>
                <Show when={step() === 1}>
                    <h1 class="text-center text-3xl font-bold text-blue-600">Giỏ Hàng</h1>
                    <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <For each={items}>
                            {(item) => (
                                <div class="flex flex-col rounded-xl border p-4">
                                    <div class="flex gap-4">
                                        <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            <img
                                                src={
                                                    item.media?.[0]?.url ||
                                                    item.imageUrl ||
                                                    "/no-image.png"
                                                }
                                                alt={item.name}
                                                class="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div class="flex-1">
                                            <h3 class="line-clamp-1 font-bold text-gray-800">
                                                {item.name}
                                            </h3>
                                            <p class="font-bold text-blue-600">
                                                {formatVN.format(item.price)}₫
                                            </p>
                                            <p class="text-xs text-gray-500">
                                                Danh mục: {item.category}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div class="mt-4 flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    (item.quantity || 1) <= 1
                                                        ? handleRemove?.(item._id || item.id)
                                                        : handleChangeQty?.(item._id || item.id, -1)
                                                }
                                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-gray-800 hover:bg-gray-200"
                                            >
                                                -
                                            </button>
                                            <span class="w-12 text-center font-bold">
                                                {item.quantity || 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleChangeQty?.(item._id || item.id, 1)
                                                }
                                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-gray-800 hover:bg-gray-200"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove?.(item._id || item.id)}
                                            class="rounded-lg p-2 text-xl text-red-500 hover:bg-red-50"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            )}
                        </For>
                    </section>

                    <div class="space-y-2 border-t pt-4">
                        <div class="flex justify-between font-bold text-gray-600">
                            <span>Tạm tính:</span>
                            <span>{formatVN.format(subtotal())}₫</span>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            class="mt-4 w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                            Tiến hành thanh toán
                        </button>
                    </div>
                </Show>

                <Show when={step() === 2}>
                    <h2 class="text-center text-2xl font-bold text-blue-600">
                        Thông tin giao hàng
                    </h2>
                    <form onSubmit={handleInfoSubmit} class="mx-auto max-w-lg space-y-4">
                        <Show
                            when={!profile}
                            fallback={
                                <div class="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-6">
                                    <p class="mb-2 text-sm text-gray-500">
                                        Hệ thống sẽ tự động sử dụng thông tin từ Hồ sơ của bạn để
                                        giao hàng:
                                    </p>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <strong class="text-gray-700">Người nhận:</strong>{" "}
                                            {profile?.fullName || "Chưa cập nhật"}
                                        </div>
                                        <div>
                                            <strong class="text-gray-700">Điện thoại:</strong>{" "}
                                            {profile?.phone || "Chưa cập nhật"}
                                        </div>
                                        <div class="col-span-2">
                                            <strong class="text-gray-700">Địa chỉ:</strong>{" "}
                                            {profile?.address || "Chưa cập nhật"}
                                        </div>
                                    </div>
                                    <input
                                        type="hidden"
                                        name="fullName"
                                        value={profile?.fullName || ""}
                                    />
                                    <input
                                        type="hidden"
                                        name="phone"
                                        value={profile?.phone || ""}
                                    />
                                    <input
                                        type="hidden"
                                        name="address"
                                        value={profile?.address || ""}
                                    />
                                    <p class="mt-2 text-xs italic text-yellow-600">
                                        * Nếu muốn thay đổi, vui lòng cập nhật trong mục Hồ sơ.
                                    </p>
                                </div>
                            }
                        >
                            <div class="grid grid-cols-1 gap-4">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-600">
                                        Tên người nhận
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={shippingInfo().fullName}
                                        placeholder="Họ tên người nhận"
                                        required
                                        class="w-full rounded-xl border p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-600">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={shippingInfo().phone}
                                        placeholder="Số điện thoại"
                                        required
                                        class="w-full rounded-xl border p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-600">
                                        Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={shippingInfo().address}
                                        placeholder="Địa chỉ đặt hàng"
                                        required
                                        class="w-full rounded-xl border p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        </Show>

                        <div class="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                class="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 transition hover:bg-gray-200"
                            >
                                Quay lại
                            </button>
                            <button
                                type="submit"
                                class="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </form>
                </Show>

                <Show when={step() === 3}>
                    <h2 class="text-center text-2xl font-bold text-blue-600">Kiểm tra đơn hàng</h2>
                    <div class="mx-auto max-w-xl space-y-6">
                        <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <h3 class="mb-3 border-b pb-2 font-bold text-gray-800">
                                Danh sách sản phẩm
                            </h3>
                            <ul class="space-y-2">
                                <For each={items}>
                                    {(item) => (
                                        <li class="flex justify-between text-sm">
                                            <span>
                                                {item.quantity}x {item.name}
                                            </span>
                                            <span class="font-semibold">
                                                {formatVN.format(
                                                    Number(item.price || 0) * (item.quantity || 1),
                                                )}
                                                ₫
                                            </span>
                                        </li>
                                    )}
                                </For>
                            </ul>
                        </div>

                        <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <h3 class="mb-3 border-b pb-2 font-bold text-gray-800">
                                Giao hàng đến
                            </h3>
                            <p class="text-sm">
                                <strong>Người nhận:</strong> {shippingInfo().fullName}
                            </p>
                            <p class="text-sm">
                                <strong>SĐT:</strong> {shippingInfo().phone}
                            </p>
                            <p class="text-sm">
                                <strong>Địa chỉ:</strong> {shippingInfo().address}
                            </p>
                        </div>

                        <div class="space-y-2 border-t pt-4">
                            <div class="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{formatVN.format(subtotal())}₫</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span>{formatVN.format(shippingFee())}₫</span>
                            </div>
                            <div class="flex justify-between border-t pt-2 text-2xl font-bold text-gray-800">
                                <span>Tổng cộng:</span>
                                <span class="text-blue-600">{formatVN.format(total())}₫</span>
                            </div>
                        </div>

                        <div class="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                class="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 transition hover:bg-gray-200"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={finalSubmit}
                                class="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700"
                            >
                                Tạo Đơn Hàng
                            </button>
                        </div>
                    </div>
                </Show>
            </article>
        </Show>
    );
};
