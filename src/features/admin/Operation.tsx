import { createSignal, Show } from "solid-js";

export const Operation = (props) => {
    // Props nhận vào:
    // props.type: "user" | "product" - Xác định loại đối tượng để đổi Label
    // props.totalCount: Số lượng tổng
    // props.groupedGroups: Danh sách nhóm
    // props.onAction: Hàm xử lý khi bấm các nút thao tác

    const [searchQuery, setSearchQuery] = createSignal("");
    const [timeFilter, setTimeFilter] = createSignal("1year");

    // Thay đổi Label tự động theo loại (user hay product)
    const label = props.type === "user" ? "người dùng" : "sản phẩm";

    return (
        <div class="mt-8 space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h2 class="text-xl font-bold text-gray-800">Thanh Công Cụ Quản Trị</h2>
                <div class="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
                    Tổng số {label}: {props.totalCount || 0}
                </div>
            </div>

            {/* Các nút hành động chính */}
            <div class="flex flex-wrap gap-3">
                <button
                    class="flex-1 rounded-xl bg-blue-50 px-6 py-2.5 font-bold text-blue-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-100 md:flex-none"
                    onClick={() => props.onAction?.("Gửi")}
                >
                    Gửi thông báo
                </button>
                <button
                    class="flex-1 rounded-xl bg-orange-50 px-6 py-2.5 font-bold text-orange-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-100 md:flex-none"
                    onClick={() => props.onAction?.("Chặn")}
                >
                    Chặn {label}
                </button>
                <button
                    class="flex-1 rounded-xl bg-red-50 px-6 py-2.5 font-bold text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-100 md:flex-none"
                    onClick={() => props.onAction?.("Xóa")}
                >
                    Xóa {label}
                </button>
            </div>

            {/* Hiển thị nhóm */}
            <div class="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                <h3 class="mb-3 text-sm font-bold text-gray-700">Phân loại / Nhóm</h3>
                <Show
                    when={props.groupedGroups && props.groupedGroups.length > 0}
                    fallback={
                        <p class="text-sm italic text-gray-400">
                            Hiện tại không có nhóm {label} nào.
                        </p>
                    }
                >
                    <ul class="space-y-2">
                        {props.groupedGroups.map((group) => (
                            <li
                                class="flex items-center justify-between rounded-xl border border-gray-50 bg-white p-3 text-sm shadow-sm"
                                key={group.role}
                            >
                                <span>
                                    <strong class="text-gray-700">{group.role}</strong> -{" "}
                                    <span class="text-gray-500">
                                        {group.memberCount} thành viên
                                    </span>
                                </span>
                                <button class="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                    Xem chi tiết
                                </button>
                            </li>
                        ))}
                    </ul>
                </Show>
            </div>

            {/* Bộ lọc và Tìm kiếm */}
            <div class="grid gap-6 rounded-2xl border border-gray-100 bg-gray-50/50 p-5 md:grid-cols-2">
                <div class="space-y-2">
                    <h3 class="text-sm font-bold text-gray-700">Tìm kiếm nhanh</h3>
                    <input
                        type="text"
                        placeholder={`Nhập tên hoặc mã ${label}...`}
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div class="space-y-2">
                    <h3 class="text-sm font-bold text-gray-700">Lọc theo kinh nghiệm/thâm niên</h3>
                    <select
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none transition-all focus:ring-4 focus:ring-blue-100"
                        value={timeFilter()}
                        onChange={(e) => setTimeFilter(e.target.value)}
                    >
                        <option value="1year">Người mới</option>
                        <option value="3year">Kinh nghiệm</option>
                        <option value="10year">Thâm niên</option>
                    </select>
                </div>
            </div>

            {/* Action theo ID cụ thể */}
            <div class="flex flex-col items-end gap-4 border-t border-gray-100 pt-4 md:flex-row">
                <div class="w-full space-y-2 md:flex-1">
                    <label class="text-sm font-bold text-gray-700">
                        Thực thi hành động theo mã {label}:
                    </label>
                    <input
                        type="text"
                        placeholder={`Mã ${label} cụ thể...`}
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none transition-all focus:ring-4 focus:ring-blue-100"
                    />
                </div>
                <button class="w-full rounded-xl bg-gray-800 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-black md:w-auto">
                    Áp dụng
                </button>
            </div>
        </div>
    );
};
