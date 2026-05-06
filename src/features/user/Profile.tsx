import { createSignal, For, Show, createResource } from "solid-js";
import { Form } from "../../components/ui/Form";
import { Icon } from "solid-heroicons";
import { 
    qrCode, 
    mapPin, 
    phone, 
    user as userIcon, 
    envelope, 
    pencilSquare, 
    square3Stack3d,
    banknotes
} from "solid-heroicons/outline";
import { checkBadge } from "solid-heroicons/solid";

export const Profile = (props) => {
    const user = () => props.user ?? {};
    const profile = () => user()?.profile ?? {};

    const [showForm, setShowForm] = createSignal(false);

    // Fetch sản phẩm do user này đăng bán
    const fetchMyProducts = async () => {
        const res = await fetch("/api/admin/products");
        if (!res.ok) return [];
        const data = await res.json();
        return (data.products || []).filter((p) => p.sellerId === (user()?.id || 1));
    };

    const [myProducts] = createResource(fetchMyProducts);

    const fields = [
        { label: "Họ và tên", key: "fullName", icon: userIcon, empty: "Chưa cập nhật họ tên" },
        { label: "Số điện thoại", key: "phone", icon: phone, empty: "Chưa cập nhật SĐT" },
        { label: "Địa chỉ liên hệ", key: "address", icon: mapPin, empty: "Chưa cập nhật địa chỉ" },
    ];

    const formFields = fields.map((f) => ({
        name: f.key,
        label: f.label,
        type: "text",
        required: true,
    }));

    const handleFormSubmit = async (data) => {
        try {
            const response = await fetch("/api/me/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("Hồ sơ đã được cập nhật thành công!");
                setShowForm(false);
                window.location.reload();
            } else {
                alert("Lỗi khi cập nhật trên server.");
            }
        } catch (err) {
            console.error(err);
            alert("Có lỗi kết nối khi cập nhật hồ sơ.");
        }
    };

    return (
        <Show when={["admin", "user"].includes(props.role)}>
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
                
                {/* Profile Header & Cover */}
                <div class="relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
                    {/* Cover Photo */}
                    <div class="h-48 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                        <div class="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                    </div>
                    
                    {/* Avatar & Actions */}
                    <div class="relative px-6 pb-8 sm:px-10">
                        <div class="-mt-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div class="flex items-end gap-5">
                                <div class="group relative rounded-full bg-white p-1.5 shadow-md">
                                    <img
                                        src={
                                            profile()?.avatar?.link ||
                                            profile()?.imgId?.link ||
                                            "https://ui-avatars.com/api/?name=" + (profile()?.fullName || user()?.username || "User") + "&background=random&size=150"
                                        }
                                        class="h-32 w-32 rounded-full object-cover ring-4 ring-white transition-transform duration-300 group-hover:scale-105"
                                        alt="Avatar"
                                    />
                                    <div class="absolute bottom-2 right-2 rounded-full bg-green-500 p-1.5 border-2 border-white" title="Online">
                                        <div class="h-3 w-3 rounded-full bg-green-400"></div>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <h1 class="flex items-center gap-2 text-3xl font-extrabold text-gray-900">
                                        {profile()?.fullName || user()?.username || "Người dùng"}
                                        <Show when={user()?.role === "admin"}>
                                            <Icon path={checkBadge} class="h-6 w-6 text-blue-500" title="Admin" />
                                        </Show>
                                    </h1>
                                    <p class="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                                        <Icon path={envelope} class="h-4 w-4" />
                                        {user()?.email || "Chưa có email"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                class="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-1 hover:bg-gray-800 hover:shadow-xl active:translate-y-0"
                            >
                                <Icon path={pencilSquare} class="h-5 w-5" />
                                Chỉnh sửa hồ sơ
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Info & QR */}
                    <div class="space-y-8 lg:col-span-1">
                        {/* Info Card */}
                        <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50">
                            <h3 class="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Icon path={userIcon} class="h-5 w-5 text-blue-500" />
                                Thông tin liên hệ
                            </h3>
                            <div class="space-y-5">
                                <For each={fields}>
                                    {(field) => (
                                        <div class="group flex items-start gap-4 rounded-2xl p-3 transition-colors hover:bg-gray-50">
                                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                                                <Icon path={field.icon} class="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                                    {field.label}
                                                </p>
                                                <p class="text-sm font-medium text-gray-800">
                                                    {profile()?.[field.key] || (
                                                        <span class="text-gray-400 italic">
                                                            {field.empty}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* VietQR Card */}
                        <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
                            <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-50 transition-transform duration-500 group-hover:scale-150"></div>
                            <div class="relative">
                                <h3 class="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Icon path={banknotes} class="h-5 w-5 text-purple-500" />
                                    Thanh toán VietQR
                                </h3>
                                <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition-colors hover:border-purple-300">
                                    <Show
                                        when={user()?.vietqrId}
                                        fallback={
                                            <div class="text-center text-gray-400">
                                                <Icon path={qrCode} class="mx-auto mb-2 h-12 w-12 opacity-50" />
                                                <p class="text-sm font-medium">Chưa thiết lập mã QR</p>
                                            </div>
                                        }
                                    >
                                        <img 
                                            src={user()?.vietqrId?.includes('/') ? user()?.vietqrId : `/vietqr/${user()?.vietqrId}`} 
                                            alt="Mã QR thanh toán" 
                                            class="h-40 w-40 rounded-xl object-contain shadow-sm transition-transform hover:scale-105" 
                                        />
                                    </Show>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User's Products / Assemblies */}
                    <div class="space-y-8 lg:col-span-2">
                        <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50">
                            <div class="mb-6 flex items-center justify-between">
                                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Icon path={square3Stack3d} class="h-5 w-5 text-indigo-500" />
                                    Tài sản đang cho thuê
                                </h3>
                                <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                    {myProducts()?.length || 0} sản phẩm
                                </span>
                            </div>

                            <Show 
                                when={myProducts() && myProducts().length > 0} 
                                fallback={
                                    <div class="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                                        <Icon path={square3Stack3d} class="mb-3 h-12 w-12 opacity-20" />
                                        <p class="text-sm font-medium">Bạn chưa đăng tài sản nào để cho thuê</p>
                                        <button class="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                            Đăng tin mới
                                        </button>
                                    </div>
                                }
                            >
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <For each={myProducts()}>
                                        {(product) => (
                                            <div class="group flex items-center gap-4 rounded-2xl border border-gray-100 p-3 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50">
                                                <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                                    <img 
                                                        src={product.media?.[0]?.link || "https://placehold.co/150x150?text=No+Image"} 
                                                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                        alt={product.name} 
                                                    />
                                                </div>
                                                <div class="flex flex-col justify-center">
                                                    <h4 class="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    <p class="text-sm font-semibold text-indigo-500 mt-1">
                                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                                                    </p>
                                                    <div class="mt-2 flex items-center gap-2">
                                                        <span class={`h-2 w-2 rounded-full ${product.status ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                        <span class="text-xs font-medium text-gray-500">
                                                            {product.status ? 'Đang hoạt động' : 'Tạm ẩn'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>
            </div>

            <Show when={showForm()}>
                <Form
                    title="Cập nhật hồ sơ cá nhân"
                    role={props.role}
                    fields={formFields}
                    initialData={profile()}
                    showMedia={true}
                    mediaType="image"
                    onClose={() => setShowForm(false)}
                    onSubmit={handleFormSubmit}
                />
            </Show>
        </Show>
    );
};
