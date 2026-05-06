import { createMemo, Suspense } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import { Icon } from "solid-heroicons";
import { archiveBox, users, cube, cog8Tooth, globeAlt, clock, square3Stack3d } from "solid-heroicons/solid";

import { ManageUser } from "./ManageUser";
import { ManageProduct } from "./ManageProduct";
import { SettingSystem } from "./SettingSystem";
import { Activity } from "./Activity";
import { Local } from "./Local";

export const Dashboard = (props) => {
    const [searchParams] = useSearchParams();
    const tabs = {
        manageUser: ManageUser,
        manageProduct: ManageProduct,
        systemSetting: SettingSystem,
        local: Local,
        activity: Activity,
    };
    const activeTab = createMemo(() => searchParams.tab || "manageUser");
    const ActiveComponent = createMemo(() => tabs[activeTab()]);
    if (props.role !== "admin") {
        return (
            <div class="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
                <Icon path={cube} class="h-16 w-16 text-red-500" />
                <h1 class="text-2xl font-bold text-gray-800">Truy cập bị từ chối</h1>
                <p class="text-gray-600">Bạn cần có quyền Quản trị viên (Admin) để xem trang này.</p>
                <A href="/" class="mt-4 rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Về trang chủ</A>
            </div>
        );
    }
    const navItems = [
        { id: "manageUser", label: "Người dùng", icon: users },
        { id: "manageProduct", label: "Sản phẩm", icon: square3Stack3d },
        { id: "systemSetting", label: "Cài đặt", icon: cog8Tooth },
        { id: "local", label: "Bản đồ", icon: globeAlt },
        { id: "activity", label: "Hoạt động", icon: clock },
    ];

    return (
        <div class="flex min-h-[80vh] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:flex-row">
            {/* Sidebar */}
            <aside class="flex w-full flex-col border-r border-gray-100 bg-gray-50/50 md:w-64">
                <div class="border-b border-gray-100 p-6">
                    <h2 class="text-xl font-bold text-gray-800">Bảng điều khiển</h2>
                    <p class="mt-2 text-gray-600">Chào mừng bạn quay lại trang quản trị!</p>
                </div>
                <nav class="flex-1 space-y-2 overflow-y-auto p-4">
                    {navItems.map((item) => (
                        <A
                            href={item.href || `/dashboard?tab=${item.id}`}
                            class={`flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${!item.href && activeTab() === item.id
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : "text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                                }`}
                        >
                            <Icon path={item.icon} class="h-5 w-5" />
                            <span>{item.label}</span>
                        </A>
                    ))}
                    <div class="mt-4 border-t border-gray-100 pt-4">
                        <A href="/"
                            class="flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium text-orange-600 transition-all hover:bg-orange-50 hover:shadow-sm"
                        >
                            <Icon path={archiveBox} class="h-5 w-5" />
                            <span>Quản lý kho</span>
                        </A>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main class="flex-1 overflow-y-auto p-6 md:p-8">
                <Suspense fallback={
                    <div class="flex h-full flex-col items-center justify-center space-y-4 text-gray-400">
                        <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                        <p class="animate-pulse font-medium">Đang tải dữ liệu...</p>
                    </div>
                }>
                    <Dynamic component={ActiveComponent()} role={props.role} />
                </Suspense>
            </main>
        </div>
    );
};
