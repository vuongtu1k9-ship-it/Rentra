export const Activity = (props) => {
    if (props.role !== "admin") {
        return null;
    }
    return (
        <article class="space-y-6">
            <div class="flex items-center justify-between rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md">
                <div>
                    <h1 class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                        Nhật ký Hoạt động
                    </h1>
                    <p class="mt-1 text-sm text-gray-500">Xem các hoạt động gần đây của hệ thống</p>
                </div>
            </div>

            {(props.logs || []).length === 0 ? (
                <div class="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                    <p class="text-gray-500 italic">Chưa có nhật ký hoạt động nào.</p>
                </div>
            ) : (
                <div class="space-y-4">
                    {(props.logs || []).map((log, index) => (
                        <div key={index} class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <p><strong>Người dùng:</strong> {log.seller ? log.seller(log.userId) : log.userId}</p>
                            <p><strong>Thao tác:</strong> {log.action}</p>
                            <p><strong>Thông điệp:</strong> {log.message}</p>
                            <p><strong>Thời gian:</strong> {log.startDate}</p>
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
};
