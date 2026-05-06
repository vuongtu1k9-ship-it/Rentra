import { createSignal } from "solid-js";
import { Profile } from "../user/Profile";
import { Operation } from "./Operation";

export const ManageUser = (props) => {
    const [users] = createSignal(props.users || []);
    const [totalUser] = createSignal(props.totalUser || 0);
    const [groupedGroup] = createSignal(props.groupedGroup || []);

    const handleAction = (action) => {
        alert(`Đã chọn hành động [${action}] cho Người dùng!`);
    };
    if (props.role !== "admin") return null;
    return (
        <article class="space-y-6">
            <div class="flex items-center justify-between rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md">
                <div>
                    <h1 class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                        Quản lý Người dùng
                    </h1>
                    <p class="mt-1 text-sm text-gray-500">Danh sách người dùng và nhóm quyền</p>
                </div>
            </div>

            {/* View: Component Profile từ trang User (Admin có thể xem dưới quyền role='admin') */}
            <Profile role={props.role} />

            {/* Action: Thanh công cụ Admin được cấu hình riêng cho User */}
            <Operation
                type="user"
                totalCount={users().length || totalUser()}
                onAction={handleAction}
                groupedGroups={groupedGroup()}
            />
        </article>
    );
};
