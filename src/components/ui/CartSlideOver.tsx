import { Transition, Dialog, DialogPanel, DialogTitle, DialogOverlay } from "solid-headless";
import { Icon } from "solid-heroicons";
import { xCircle } from "solid-heroicons/solid";
import { Show, For } from "solid-js";

export const CartSlideOver = (props) => {
    const subtotal = () =>
        props.items.reduce((sum, i) => sum + Number(i.price || 0) * (i.quantity || 1), 0);

    return (
        <Transition show={props.isOpen}>
            <Dialog
                isOpen
                class="fixed inset-0 z-[100] overflow-hidden"
                onClose={() => props.setIsOpen(false)} >
                <Transition
                    show={props.isOpen}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogOverlay class="absolute inset-0 bg-black/20" />
                </Transition>

                <div class="fixed inset-y-0 right-0 flex max-w-full">
                    {/* Bảng trượt Giỏ hàng */}
                    <Transition
                        show={props.isOpen}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                    >
                        <DialogPanel class="w-screen max-w-md">
                            <div class="flex h-full flex-col bg-white shadow-2xl">
                                <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                    <div class="flex items-start justify-between">
                                        <DialogTitle class="text-lg font-medium text-gray-900">
                                            Giỏ hàng của bạn
                                        </DialogTitle>
                                        <div class="ml-3 flex h-7 items-center">
                                            <button
                                                type="button"
                                                class="-m-2 p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                                                onClick={() => props.setIsOpen(false)}
                                            >
                                                <span class="sr-only">Đóng giỏ hàng</span>
                                                <Icon path={xCircle} class="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <div class="mt-8">
                                        <div class="flow-root">
                                            <Show
                                                when={props.items && props.items.length > 0}
                                                fallback={
                                                    <div class="py-20 text-center">
                                                        <p class="text-gray-500">
                                                            Giỏ hàng của bạn đang trống.
                                                        </p>
                                                    </div>
                                                }
                                            >
                                                <ul class="-my-6 divide-y divide-gray-200">
                                                    <For each={props.items}>
                                                        {(item) => (
                                                            <li class="flex py-6">
                                                                <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                    <img
                                                                        src={
                                                                            item.imageUrl ||
                                                                            "https://placehold.co/150x150?text=No+Image"
                                                                        }
                                                                        alt={item.name}
                                                                        class="h-full w-full object-cover object-center"
                                                                    />
                                                                </div>

                                                                <div class="ml-4 flex flex-1 flex-col">
                                                                    <div>
                                                                        <div class="flex justify-between text-base font-medium text-gray-900">
                                                                            <h3 class="line-clamp-2">
                                                                                {item.name}
                                                                            </h3>
                                                                            <p class="ml-4 whitespace-nowrap font-bold text-red-600">
                                                                                {Number(
                                                                                    item.price,
                                                                                ).toLocaleString()}
                                                                                đ
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div class="flex flex-1 items-end justify-between text-sm">
                                                                        <div class="flex items-center rounded-lg border bg-gray-50">
                                                                            <button
                                                                                class="px-3 py-1 text-gray-600 hover:bg-gray-200"
                                                                                onClick={() =>
                                                                                    props.handleChangeQty(
                                                                                        item._id ||
                                                                                        item.id,
                                                                                        -1,
                                                                                    )
                                                                                }
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <span class="px-4 font-medium">
                                                                                {item.quantity}
                                                                            </span>
                                                                            <button
                                                                                class="px-3 py-1 text-gray-600 hover:bg-gray-200"
                                                                                onClick={() =>
                                                                                    props.handleChangeQty(
                                                                                        item._id ||
                                                                                        item.id,
                                                                                        1,
                                                                                    )
                                                                                }
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            class="font-medium text-blue-600 hover:text-blue-500"
                                                                            onClick={() =>
                                                                                props.handleRemove(
                                                                                    item._id ||
                                                                                    item.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )}
                                                    </For>
                                                </ul>
                                            </Show>
                                        </div>
                                    </div>
                                </div>

                                <div class="border-t border-gray-200 px-4 py-6 sm:px-6">
                                    <div class="mb-2 flex justify-between text-base font-medium text-gray-900">
                                        <p>Tổng tạm tính</p>
                                        <p class="text-red-600">{subtotal().toLocaleString()}đ</p>
                                    </div>
                                    <p class="mt-0.5 text-sm text-gray-500">
                                        Phí vận chuyển và thuế sẽ được tính khi thanh toán.
                                    </p>
                                    <div class="mt-6">
                                        <a
                                            href="/cart"
                                            onClick={() => props.setIsOpen(false)}
                                            disabled={!props.items || props.items.length === 0}
                                            class="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                        >
                                            Tiến hành thanh toán
                                        </a>
                                    </div>
                                    <div class="mt-6 flex justify-center text-center text-sm text-gray-500">
                                        <p>
                                            hoặc{" "}
                                            <button
                                                type="button"
                                                class="font-medium text-blue-600 hover:text-blue-500"
                                                onClick={() => props.setIsOpen(false)}
                                            >
                                                Tiếp tục mua sắm
                                                <span aria-hidden="true"> &rarr;</span>
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </Transition>
                </div>
            </Dialog>
        </Transition>
    );
};
