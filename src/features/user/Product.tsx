import { Icon } from "solid-heroicons";
import { magnifyingGlass, bars3, cube, play, documentText, plus, pencilSquare, trash, users, shoppingCart, } from "solid-heroicons/solid";
import { createSignal, createResource, For, Show } from "solid-js";
import { Form } from "../../components/ui/Form";

const menus = [
    {
        title: "Sản phẩm",
        desc: "Mặt bằng, ki-ốt, hàng hóa",
        icon: cube,
    },
    {
        title: "Tài khoản",
        desc: "Thông tin, bảo mật",
        icon: users,
    },
];

const formatVN = (n) => n?.toLocaleString?.("vi-VN") ?? 0;
const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (!res.ok) return { products: [] };
    const data = await res.json();
    return data.products || [];
};

export const Product = (props) => {
    const [search, setSearch] = createSignal("");
    const [showForm, setShowForm] = createSignal(false);
    const [selectedId, setSelectedId] = createSignal(null);

    const [products, { refetch }] = createResource(fetchProducts);

    const list = () =>
        products()?.filter?.((p) => p?.name?.toLowerCase?.().includes(search().toLowerCase())) ??
        [];

    const selectedProduct = () =>
        list().find((p) => p.id === selectedId() || p._id === selectedId());

    const productFields = [
        { name: "name", label: "Tên mặt hàng", type: "text", required: true },
        { name: "description", label: "Mô tả chi tiết", type: "textarea", required: true },
        { name: "price", label: "Giá thuê/bán (₫)", type: "number", required: true, min: 0 },
        { name: "category", label: "Phân loại", type: "text", required: true },
        { name: "quantity", label: "Số lượng", type: "number", required: true, min: 0 },
        { name: "mass", label: "Diện tích/Khối lượng", type: "number", required: false, min: 0 },
        { name: "lwh", label: "Kích thước (D-R-C)", type: "text", required: false },
        { name: "expired", label: "Hạn mức", type: "date", required: false },
        {
            name: "status",
            label: "Trạng thái",
            type: "select",
            options: [
                { label: "Còn trống/hàng", value: "true" },
                { label: "Đã cho thuê/hết", value: "false" },
            ],
        },
    ];

    const handleFormSubmit = async (data) => {
        const payload = {
            ...data,
            price: String(data.price),
            quantity: Number(data.quantity) || 0,
            mass: Number(data.mass) || 0,
            status: data.status === "true" || data.status === true,
        };

        try {
            if (data.media?.file) {
                const formData = new FormData();
                formData.append("file", data.media.file);

                const uploadRes = await fetch("/api/file", {
                    method: "POST",
                    body: formData,
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    if (uploadData.success && uploadData.uploaded?.length > 0) {
                        const fileData = uploadData.uploaded[0];
                        payload.media = [
                            {
                                fileId: fileData.fileId,
                                url: fileData.url,
                                type: data.media.type,
                            },
                        ];
                    }
                } else {
                    alert("Lỗi khi tải lên file phương tiện");
                    return;
                }
            } else if (data.media?.link) {
                payload.media = selectedProduct()?.media || [];
            } else {
                payload.media = [];
            }

            delete payload.file;

            if (selectedId()) {
                const res = await fetch("/api/admin/products", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: selectedId(), ...payload }),
                });
                if (res.ok) alert(`Đã cập nhật: ${data.name}`);
            } else {
                const res = await fetch("/api/admin/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (res.ok) alert(`Đã thêm mới: ${data.name}`);
            }
            setShowForm(false);
            refetch();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu dữ liệu");
        }
    };

    const handleDelete = async () => {
        if (!selectedId()) return alert("Vui lòng chọn mục để xóa");
        const product = selectedProduct();
        const currentQty = product?.quantity ?? 0;
        if (!confirm("Bạn có chắc chắn muốn xóa?")) return;

        let removeQty = prompt("Nhập số lượng muốn xóa (để trống = xóa toàn bộ):");
        if (removeQty === null || removeQty === "") {
            removeQty = currentQty;
        } else {
            removeQty = parseInt(removeQty, 10);
            if (isNaN(removeQty) || removeQty <= 0) return alert("Số lượng không hợp lệ.");
        }

        try {
            const res = await fetch(`/api/admin/products/${selectedId()}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: removeQty }),
            });
            const result = await res.json();
            if (res.ok) {
                alert(
                    result.removed
                        ? "Đã xóa hoàn toàn!"
                        : `Đã giảm số lượng. Còn lại: ${result.newQuantity}`,
                );
                setSelectedId(null);
                refetch();
            } else {
                alert(result.error || "Không thể xóa");
            }
        } catch (err) {
            alert("Lỗi hệ thống");
        }
    };

    const addToCart = (product) => {
        if (props.onAddToCart) {
            props.onAddToCart(product);
        } else {
            alert("Lỗi: Không thể thêm vào giỏ hàng!");
        }
    };

    return (
        <div class="animate-in fade-in mx-auto max-w-7xl space-y-8 p-4 duration-500 sm:p-8">
            {/* ======Search & Menu====== */}
            <header class="flex flex-col items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row">
                <div class="relative w-full sm:max-w-md">
                    <Icon
                        path={magnifyingGlass}
                        class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="search"
                        placeholder="Tìm kiếm mặt bằng, sản phẩm..."
                        class="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 font-medium outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        onInput={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>
            {props.role === "admin" ? (
                <>
                    <div class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div class="flex items-center justify-between border-b border-gray-50 px-8 py-6">
                            <h2 class="text-xl font-bold tracking-tight text-gray-800">
                                Quản lý Mặt bằng / Sản phẩm
                            </h2>
                            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                                {list().length} mục
                            </span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th class="px-8 py-4">Hình ảnh</th>
                                        <th class="px-6 py-4">Giá thuê/bán</th>
                                        <th class="px-6 py-4">Chi tiết</th>
                                        <th class="px-6 py-4">Diện tích/KL</th>
                                        <th class="px-6 py-4">Loại</th>
                                        <th class="px-6 py-4">Số lượng</th>
                                        <th class="px-6 py-4">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-50">
                                    <For each={list()}>
                                        {(p) => (
                                            <tr
                                                class={`group cursor-pointer transition-all ${selectedId() === (p.id || p._id) ? "bg-blue-50/50 ring-1 ring-inset ring-blue-500/20" : "hover:bg-gray-50"}`}
                                                onClick={() => setSelectedId(p.id || p._id)}
                                            >
                                                <td class="px-8 py-4">
                                                    <div class="relative h-16 w-16 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                                                        <img
                                                            src={
                                                                p?.media?.[0]?.url ||
                                                                "https://placehold.co/150x150?text=No+Image"
                                                            }
                                                            class="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 text-sm font-bold text-gray-700">
                                                    {formatVN(p?.price)}₫
                                                </td>
                                                <td class="px-6 py-4">
                                                    <div class="max-w-[200px]">
                                                        <p class="line-clamp-1 text-sm font-bold text-gray-800">
                                                            {p?.name ?? "N/A"}
                                                        </p>
                                                        <p class="mt-1 line-clamp-2 text-[10px] text-gray-400">
                                                            {p?.description ?? ""}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 text-sm font-semibold text-gray-600">
                                                    {p?.mass ? `${p.mass}` : "N/A"}
                                                </td>
                                                <td class="whitespace-nowrap px-6 py-4 text-xs font-medium text-gray-500">
                                                    {p?.category ?? ""}
                                                </td>
                                                <td class="px-6 py-4 text-sm font-semibold text-gray-600">
                                                    {formatVN(p?.quantity)}
                                                </td>
                                                <td class="px-6 py-4">
                                                    <span
                                                        class={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${p?.status ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                                                    >
                                                        {p?.status ? "Khả dụng" : "Hết trống"}
                                                    </span>
                                                </td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="sticky bottom-8 z-10 ml-auto flex w-fit items-center justify-center gap-4 rounded-3xl border border-gray-100 bg-white/80 px-6 py-4 shadow-xl shadow-gray-200/50 backdrop-blur-md sm:justify-end">
                        <button
                            onClick={() => {
                                setSelectedId(null);
                                setShowForm(true);
                            }}
                            class="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 hover:bg-blue-700"
                        >
                            <Icon path={plus} class="h-4 w-4" /> Thêm mới
                        </button>
                        <button
                            onClick={() =>
                                selectedId() ? setShowForm(true) : alert("Chọn mục để sửa")
                            }
                            class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 shadow-sm transition-all hover:-translate-y-1 hover:bg-gray-50"
                        >
                            <Icon path={pencilSquare} class="h-4 w-4" /> Sửa
                        </button>
                        <button
                            onClick={handleDelete}
                            class="flex items-center gap-2 rounded-2xl bg-red-50 px-6 py-3 font-bold text-red-600 transition-all hover:-translate-y-1 hover:bg-red-100"
                        >
                            <Icon path={trash} class="h-4 w-4" /> Xóa
                        </button>
                    </div>
                </>
            ) : (
                /* Giao diện Khách hàng: Dạng Lưới (Ecommerce Grid) chuẩn Tailwind UI */
                <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
                    <h2 class="mb-8 text-2xl font-bold tracking-tight text-gray-900">
                        Danh sách Mặt bằng & Sản phẩm
                    </h2>
                    <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                        <Show
                            when={!products.loading}
                            fallback={
                                <div class="col-span-full py-20 text-center italic text-gray-500">
                                    Đang tải danh sách...
                                </div>
                            }
                        >
                            <For each={list()} fallback={
                                <div class="col-span-full py-20 text-center text-gray-500">
                                    Không tìm thấy kết quả phù hợp.
                                </div>
                            }>
                                {(p) => (
                                    <div class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                                        <div class="aspect-w-3 aspect-h-4 sm:aspect-none relative overflow-hidden bg-gray-200 sm:h-64">
                                            <img
                                                src={
                                                    p?.media?.[0]?.url ||
                                                    "https://placehold.co/400x400?text=No+Image"
                                                }
                                                alt={p.name}
                                                class="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 sm:h-full sm:w-full"
                                            />
                                            {!p.status && (
                                                <div class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                                    <span class="-rotate-12 transform rounded-full bg-red-600 px-4 py-2 font-bold text-white shadow-lg">
                                                        HẾT TRỐNG
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div class="flex flex-1 flex-col p-5">
                                            <h3 class="line-clamp-1 text-base font-bold text-gray-900">
                                                {p.name}
                                            </h3>
                                            <p class="mt-1 text-sm text-gray-500">{p.category}</p>
                                            <p class="mt-3 line-clamp-2 flex-grow text-sm text-gray-600">
                                                {p.description}
                                            </p>
                                            <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                                                <p class="text-lg font-extrabold text-blue-600">
                                                    {formatVN(p.price)}₫
                                                    <span class="text-xs font-normal text-gray-400">
                                                        /tháng
                                                    </span>
                                                </p>
                                                <button
                                                    onClick={() => addToCart(p)}
                                                    disabled={!p.status}
                                                    class="flex items-center justify-center rounded-full bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400">
                                                    <Icon path={shoppingCart} class="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </For>
                        </Show>
                    </div>
                </div>
            )}
            <Show when={showForm()}>
                <Form title={selectedId() ? "Sửa thông tin" : "Thêm mặt bằng/sản phẩm"}
                    fields={productFields}
                    initialData={selectedProduct()}
                    showMedia={true}
                    onClose={() => setShowForm(false)}
                    onSubmit={handleFormSubmit}
                />
            </Show>
        </div>
    );
};
