import { createSignal, Show, For } from "solid-js";

export const Order = (props) => {
    const [days, setDays] = createSignal(1);

    const orders = () => props.orders ?? [];
    if (props.role !== "admin" && props.role !== "user") return null;
    return (
        <Show when={["admin", "user"].includes(props.role)}>
            <table class="orders__table">
                <caption class="orders__title">Đơn hàng của bạn</caption>

                <thead>
                    <tr class="orders__head">
                        <th>Sản phẩm</th>
                        <th>Giao hàng</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>

                <tbody>
                    <Show
                        when={orders().length}
                        fallback={
                            <tr>
                                <td colspan="4" class="orders__empty">
                                    Hiện tại không có đơn hàng nào.
                                </td>
                            </tr>
                        }
                    >
                        <For each={orders()}>
                            {(order) => {
                                const items = order?.items ?? [];
                                const shipping = order?.shippingInfo ?? {};

                                return (
                                    <tr class="orders__row" data-id={order?._id ?? ""}>
                                        {/* Products */}

                                        <td class="orders__products">
                                            <For each={items}>
                                                {(item, i) => (
                                                    <fieldset class="orders__product">
                                                        <legend>Sản phẩm {i() + 1}</legend>

                                                        <div>
                                                            <strong>SP:</strong>
                                                            {item?.name ?? "N/A"}
                                                            <br />

                                                            <strong>SL:</strong>
                                                            <span class="quantity">
                                                                {item?.quantity ?? 0}
                                                            </span>
                                                            <br />

                                                            <strong>Giá:</strong>
                                                            <span class="price">
                                                                {(item?.price ?? 0).toLocaleString(
                                                                    "vi-VN",
                                                                )}{" "}
                                                                ₫
                                                            </span>
                                                        </div>
                                                    </fieldset>
                                                )}
                                            </For>
                                        </td>

                                        {/* Shipping */}

                                        <td class="orders__shipping">
                                            <fieldset class="orders__box">
                                                <legend>Người nhận</legend>

                                                <div>
                                                    <strong>Người nhận:</strong>
                                                    {shipping?.fullName ?? "-"}
                                                </div>

                                                <div>
                                                    <strong>Địa chỉ:</strong>
                                                    {shipping?.address ?? "-"}
                                                </div>

                                                <div>
                                                    <strong>SĐT:</strong>
                                                    {shipping?.phone ?? "-"}
                                                </div>
                                            </fieldset>
                                        </td>

                                        {/* Time */}

                                        <td class="orders__time">
                                            <fieldset class="orders__box">
                                                <legend>Thời gian</legend>

                                                <div>
                                                    <strong>Ngày đặt:</strong>
                                                    {order?.createdAt ?? "-"}
                                                </div>

                                                <Show when={order?.paidAt}>
                                                    <div>
                                                        <strong>Ngày trả tiền:</strong>
                                                        {order?.paidAt}
                                                    </div>
                                                </Show>
                                            </fieldset>
                                        </td>

                                        {/* Status */}

                                        <td class="orders__status">{order?.status ?? "Unknown"}</td>
                                    </tr>
                                );
                            }}
                        </For>
                    </Show>
                </tbody>
            </table>

            {/* Actions */}

            <div class="orders__actions">
                <button id="delivery" class="btn">
                    Giao hàng
                </button>

                <input
                    type="range"
                    min="1"
                    max="6"
                    value={days()}
                    onInput={(e) => setDays(Number(e.currentTarget.value))}
                />

                <p>
                    <strong>Số ngày hoãn:</strong> {days()} ngày
                </p>

                <button id="stop" class="btn">
                    Tạm dừng
                </button>

                <button id="remove" class="btn btn--danger">
                    Xóa đơn hàng
                </button>
            </div>
        </Show>
    );
};
