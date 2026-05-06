import { A } from "@solidjs/router";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { home, square3Stack3d, shoppingCart, computerDesktop, cog8Tooth, cube, arrowLeftOnRectangle, arrowRightOnRectangle, user, tv } from "solid-heroicons/solid";
export const Header = (props) => {
    const isAdmin = props.isAdmin;
    const isUser = props.isUser;
    const [redirecting, setRedirecting] = createSignal(false);

    let detailsRef;
    const handleClickOutside = (e) => {
        if (detailsRef && !detailsRef.contains(e.target)) {
            detailsRef.removeAttribute("open");
        }
    };

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
    });

    onCleanup(() => {
        document.removeEventListener("click", handleClickOutside);
    });

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
            setRedirecting(true);
            window.location.href = "/auth";
        } catch (e) {
            console.error(e);
        }
    };

    const commonMenus = [
        { href: "/", label: "Trang chủ", icon: home },
        { action: props.onOpenCart, label: "Giỏ hàng", icon: shoppingCart },
    ];

    const accountMenus = [];
    if (isAdmin) {
        accountMenus.push({ href: "/dashboard", label: "Dashboard", icon: computerDesktop });
    }
    if (isAdmin || isUser) {
        accountMenus.push({ href: "/profile", label: "Hồ sơ", icon: cog8Tooth });
        accountMenus.push({ href: "/assemply", label: "Cuộc họp", icon: tv });
        accountMenus.push({ href: "/product", label: "Sản phẩm", icon: square3Stack3d });
        accountMenus.push({ href: "/order", label: "Đơn hàng", icon: cube });
        accountMenus.push({
            href: "#",
            label: "Đăng xuất",
            icon: arrowLeftOnRectangle,
            action: handleLogout,
        });
    } else {
        accountMenus.push({ href: "/auth", label: "Đăng nhập", icon: arrowRightOnRectangle });
    }

    return (
        <header class="relative z-50 bg-gray-800 text-white shadow-md">
            <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <A href="/" class="text-shadow-sm hover:text-shadow-md bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-2xl font-black text-transparent transition-all hover:scale-105">
                    Rentra
                </A>
                <div class="flex items-center space-x-6">
                    <ul class="flex items-center space-x-6">
                        {commonMenus.map((menu) => (
                            <li key={menu.label}>
                                {menu.action ? (
                                    <button onClick={menu.action} class="flex items-center space-x-2 text-white transition-colors hover:text-yellow-400 focus:outline-none" >
                                        <Icon path={menu.icon} class="h-5 w-5" />
                                        <span>{menu.label}</span>
                                    </button>
                                ) : (
                                    <A href={menu.href} class="flex items-center space-x-2 text-white transition-colors hover:text-yellow-400">
                                        <Icon path={menu.icon} class="h-5 w-5" />
                                        <span>{menu.label}</span>
                                    </A>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Account Dropdown (Details/Summary) */}
                    <details class="group relative" ref={detailsRef}>
                        <summary class="flex cursor-pointer list-none items-center space-x-2 rounded-full bg-gray-700 px-4 py-2 transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 [&::-webkit-details-marker]:hidden">
                            <Icon path={user} class="h-5 w-5" />
                            <span>Tài khoản</span>
                            <div class="ml-1 h-4 w-4 transition-transform group-open:rotate-180">▼</div>
                        </summary>

                        <div class="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl focus:outline-none">
                            <ul class="py-2">
                                {accountMenus.map((menu) => (
                                    <li key={menu.label}>
                                        {menu.action ? (
                                            <button onClick={() => {
                                                if (detailsRef) detailsRef.removeAttribute("open");
                                                menu.action();
                                            }}
                                                class="flex w-full cursor-pointer items-center space-x-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 focus:bg-red-50 focus:outline-none">
                                                <Icon path={menu.icon} class="h-5 w-5" />{" "}
                                                <span class="font-medium">{menu.label}</span>
                                            </button>
                                        ) : (
                                            <A href={menu.href} onClick={() => { if (detailsRef) detailsRef.removeAttribute("open"); }}
                                                class="flex w-full items-center space-x-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:outline-none"
                                            >
                                                <Icon path={menu.icon} class="h-5 w-5" />{" "}
                                                <span class="font-medium">{menu.label}</span>
                                            </A>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </details>
                </div>
            </div>
        </header>
    );
};
