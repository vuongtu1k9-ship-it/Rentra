import { createSignal, createResource } from "solid-js";
import { Product } from "../user/Product";
import { Operation } from "./Operation";

const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const data = await res.json();
    // Fetch returns { products: [...] } based on user's API
    return data.products || data || [];
};

export const ManageProduct = (props) => {
    // We use this just to get the total count for the Operation bar if needed,
    // but Product itself fetches its own data internally!
    const [p] = createResource(fetchProducts);

    const handleAction = (action) => {
        alert(`Đã chọn hành động [${action}] cho Sản phẩm!`);
    };

    if (props.role !== "admin") return null;

    return (
        <article class="space-y-6">
            <div class="flex items-center justify-between rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-md">
                <div>
                    <h1 class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                        Quản lý Sản phẩm
                    </h1>
                    <p class="mt-1 text-sm text-gray-500">
                        Danh sách tất cả sản phẩm trên hệ thống
                    </p>
                </div>
            </div>

            {/* View: Component Product từ trang User hiển thị danh sách */}
            <Product role={props.role} />

            {/* Action: Thanh công cụ Admin được cấu hình riêng cho Product */}
            <Operation
                type="product"
                totalCount={p()?.length || 0}
                onAction={handleAction}
                groupedGroups={[]}
            />
        </article>
    );
};
