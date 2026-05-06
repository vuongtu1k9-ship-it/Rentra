import { lazy, createSignal, onMount, Suspense, Show } from "solid-js";
import { Router, Route } from "@solidjs/router";
import "./index.css";
import { Header } from "./components/layout/Header";
import Home from "./pages/Home";
import { Footer } from "./components/layout/Footer";
import { Auth } from "./pages/Auth";
import { Cart } from "./pages/Cart";
import { About } from "./pages/About";
import { CartSlideOver } from "./components/ui/CartSlideOver";
import { Product } from "./features/user/Product";
import { Profile } from "./features/user/Profile";
import { Order } from "./features/user/Order";
import { Assembly } from "./features/user/Assembly";
import { Silver } from "./pages/Silver";
import { Dashboard } from "./features/admin/Dashboard";

export default function App() {
    const [isAdmin, setIsAdmin] = createSignal(false);
    const [isUser, setIsUser] = createSignal(false);
    const [currentUser, setCurrentUser] = createSignal(null);
    const [loading, setLoading] = createSignal(true);
    const [cartItems, setCartItems] = createSignal([]);
    const [isCartOpen, setIsCartOpen] = createSignal(false);

    const syncCart = async (items) => {
        const simpleItems = items.map((item) => ({
            goods: item._id || item.id,
            quantity: item.quantity,
        }));
        localStorage.setItem("cartItems", JSON.stringify(simpleItems));
        setCartItems(items);
        if (isAdmin() || isUser()) {
            try {
                await fetch("/api/user/cart", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: simpleItems }),
                });
            } catch (err) {
                console.error("Lỗi đồng bộ giỏ hàng lên server:", err);
            }
        }
    };

    const populateCartDetails = async (simpleItems) => {
        try {
            const res = await fetch("/api/admin/products");
            const data = await res.json();
            const products = data.products || [];

            const itemsWithDetails = simpleItems
                .map((cartItem) => {
                    const product = products.find(
                        (p) =>
                            p.id === cartItem.goods ||
                            p.id === String(cartItem.goods) ||
                            p.id === cartItem.productId,
                    );
                    return product
                        ? {
                            ...product,
                            _id: product.id,
                            quantity: cartItem.quantity,
                        }
                        : null;
                })
                .filter(Boolean);

            setCartItems(itemsWithDetails);
        } catch (e) {
            console.error("Lỗi tải chi tiết sản phẩm:", e);
        }
    };

    onMount(async () => {
        let isAuthenticated = false;
        try {
            const res = await fetch("/api/me");
            const data = await res.json();
            if (data && data.authenticated) {
                setIsAdmin(data.role === "admin");
                setIsUser(data.role === "user");
                setCurrentUser(data);
                isAuthenticated = true;
            }
        } catch (e) {
            console.error("Auth check failed:", e);
        } finally {
            setLoading(false);
        }

        try {
            const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");

            if (isAuthenticated) {
                // Đã đăng nhập: Lấy giỏ hàng từ DB
                const apiRes = await fetch("/api/user/cart");
                if (apiRes.ok) {
                    const apiData = await apiRes.json();
                    let dbCart = apiData.items || [];

                    if (dbCart.length === 0 && localCart.length > 0) {
                        await populateCartDetails(localCart);
                        syncCart(cartItems());
                    } else if (dbCart.length > 0) {
                        // Map productId từ DB sang dạng chung
                        dbCart = dbCart.map((item) => ({
                            goods: item.productId,
                            quantity: item.quantity,
                        }));
                        await populateCartDetails(dbCart);
                    }
                }
            } else {
                // Chưa đăng nhập: Dùng LocalStorage
                if (localCart.length > 0) {
                    await populateCartDetails(localCart);
                }
            }
        } catch (e) {
            console.log("Load cart error:", e);
        }
    });

    const handleChangeQty = (id, delta) => {
        const currentItems = cartItems()
            .map((item) =>
                item._id === id || item.id === id
                    ? { ...item, quantity: (item.quantity || 1) + delta }
                    : item,
            )
            .filter((i) => (i.quantity || 0) > 0);
        syncCart(currentItems);
    };

    const handleRemove = (id) => {
        const currentItems = cartItems().filter((item) => item._id !== id && item.id !== id);
        syncCart(currentItems);
    };

    const handleAddToCart = (product) => {
        const id = product._id || product.id;
        const exists = cartItems().find((i) => i._id === id || i.id === id);
        if (exists) {
            handleChangeQty(id, 1);
        } else {
            syncCart([...cartItems(), { ...product, _id: id, quantity: 1 }]);
        }
        setIsCartOpen(true);
    };

    const handleSubmit = async (event) => {
        if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
        }

        // Must be logged in to checkout
        if (!isAdmin() && !isUser()) {
            alert("Vui lòng đăng nhập để đặt hàng!");
            window.location.href = "/auth";
            return;
        }

        const shippingInfo = event?.shippingInfo || {};

        const subtotal = cartItems().reduce(
            (sum, i) => sum + Number(i.price || 0) * (i.quantity || 1),
            0,
        );
        const shippingFee = Math.min(Math.round(subtotal * 0.05), 50000);
        const total = subtotal + shippingFee;

        const payload = {
            items: cartItems().map((item) => ({
                goods: parseInt(item._id || item.id),
                quantity: item.quantity,
            })),
            shippingFee,
            total,
            shippingInfo,
        };

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Đặt hàng thành công!");
                syncCart([]);
                window.location.href = "/order";
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Có lỗi xảy ra khi đặt hàng.");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối khi đặt hàng.");
        }
    };

    return (
        <Router
            root={(props) => (
                <div class="flex min-h-screen flex-col bg-gray-50">
                    <Show
                        when={!loading()}
                        fallback={
                            <div class="p-10 text-center text-lg italic text-gray-500">
                                Đang tải cấu hình người dùng...
                            </div>
                        }
                    >
                        <Header
                            isAdmin={isAdmin()}
                            isUser={isUser()}
                            isLoggedIn={isAdmin() || isUser()}
                            onOpenCart={() => setIsCartOpen(true)}
                        />
                        <main class="mx-auto w-full max-w-7xl flex-grow px-4 py-8">
                            <Suspense
                                fallback={
                                    <div class="p-10 text-center italic text-gray-500">
                                        Đang tải trang...
                                    </div>
                                }
                            >
                                {props.children}
                            </Suspense>
                        </main>
                        <Footer
                            isAdmin={isAdmin()}
                            isUser={isUser()}
                            isLoggedIn={isAdmin() || isUser()}
                        />
                        <CartSlideOver
                            isOpen={isCartOpen()}
                            setIsOpen={setIsCartOpen}
                            items={cartItems()}
                            handleChangeQty={handleChangeQty}
                            handleRemove={handleRemove}
                            handleSubmit={handleSubmit}
                        />
                    </Show>
                </div>
            )}
        >
            <Route path="/" component={Home} />

            <Route
                path="/product"
                component={() => (
                    <Product
                        role={isAdmin() ? "admin" : isUser() ? "user" : "guest"}
                        onAddToCart={handleAddToCart}
                    />
                )}
            />
            <Route path="/auth" component={() => <Auth isLoggedIn={isAdmin() || isUser()} />} />
            <Route
                path="/dashboard"
                component={() => (
                    <Dashboard role={isAdmin() ? "admin" : isUser() ? "user" : "guest"} />
                )}
            />
            <Route
                path="/cart"
                component={() => (
                    <Cart
                        isAdmin={isAdmin()}
                        isUser={isUser()}
                        profile={currentUser()?.profile}
                        items={cartItems()}
                        handleChangeQty={handleChangeQty}
                        handleRemove={handleRemove}
                        handleSubmit={handleSubmit}
                    />
                )}
            />
            <Route
                path="/profile"
                component={() => (
                    <Profile
                        role={isAdmin() ? "admin" : isUser() ? "user" : "guest"}
                        user={currentUser()}
                    />
                )}
            />
            <Route
                path="/order"
                component={() => <Order role={isAdmin() ? "admin" : isUser() ? "user" : "guest"} />}
            />
            <Route
                path="/assemply"
                component={() => (
                    <Assembly role={isAdmin() ? "admin" : isUser() ? "user" : "guest"} />
                )}
            />
            <Route path="/silver" component={Silver} />
            <Route path="/about" component={About} />
        </Router>
    );
}
