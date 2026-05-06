import { createSignal, Show, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Icon } from "solid-heroicons";
import { envelope, lockClosed, user, xCircle, chatBubbleOvalLeft } from "solid-heroicons/solid";

export const Auth = (props) => {
    const navigate = useNavigate();
    const [isLogIn, setIsLogIn] = createSignal(true);
    const [isLoggedIn, setIsLoggedIn] = createSignal(false);

    createEffect(() => {
        if (props.isLoggedIn) {
            navigate("/", { replace: true });
        }
    });
    const [formData, setFormData] = createSignal({
        email: "",
        password: "",
        username: "",
    });
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = formData();

        try {
            if (isLogIn()) {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: data.email, password: data.password }),
                });
                const result = await response.json();

                if (!response.ok) {
                    alert("Đăng nhập thất bại: " + (result.reason || "Lỗi không xác định"));
                    return;
                }

                alert(result.admin ? "Xin chào anh" : "Xin chào bạn");
                setIsLoggedIn(true);
                window.location.href = "/";
            } else {
                const response = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: data.username,
                        email: data.email,
                        password: data.password,
                    }),
                });
                const result = await response.json();

                if (!response.ok) {
                    alert("Đăng ký thất bại: " + (result.reason || "Lỗi không xác định"));
                    return;
                }

                alert("Đăng ký thành công!");
                setIsLogIn(true);
            }
        } catch (err) {
            alert("Lỗi kết nối đến server");
            console.error(err);
        }
    };

    if (isLoggedIn()) return null;
    return (
        <div class="flex min-h-screen items-center justify-center bg-gray-100 py-8">
            <form
                onSubmit={handleSubmit}
                class={`w-full max-w-sm space-y-6 rounded-lg bg-white p-6 shadow-lg ${isLogIn() ? "border-l-4 border-blue-500" : "border-l-4 border-green-500"
                    }`}>
                <Show
                    when={isLogIn()}
                    fallback={
                        <>
                            <span class="absolute right-3 top-3 cursor-pointer text-gray-500"
                                onClick={() => setIsLogIn(true)}
                            >
                                <Icon path={xCircle} class="h-5 w-5" />
                            </span>
                            <h2 class="text-center text-2xl font-semibold text-gray-800">
                                Đăng ký
                            </h2>
                            <div class="space-y-4">
                                <div class="flex items-center rounded-lg border border-gray-300 px-4 py-2">
                                    <Icon path={user} class="h-5 w-5 text-gray-500" />
                                    <input
                                        type="text"
                                        id="username"
                                        placeholder="Tên người dùng"
                                        required
                                        onInput={handleChange}
                                        value={formData().username}
                                        class="w-full py-2 pl-3 outline-none"
                                    />
                                </div>

                                <div class="flex items-center rounded-lg border border-gray-300 px-4 py-2">
                                    <Icon path={envelope} class="h-5 w-5 text-gray-500" />
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Email"
                                        required
                                        onInput={handleChange}
                                        value={formData().email}
                                        class="w-full py-2 pl-3 outline-none"
                                    />
                                </div>
                                <div class="flex items-center rounded-lg border border-gray-300 px-4 py-2">
                                    <Icon path={lockClosed} class="h-5 w-5 text-gray-500" />
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Mật khẩu"
                                        required
                                        onInput={handleChange}
                                        value={formData().password}
                                        class="w-full py-2 pl-3 outline-none"
                                    />
                                </div>
                                <input
                                    type="submit"
                                    value="Đăng ký"
                                    class="w-full rounded-lg bg-green-500 py-3 text-white transition duration-200 hover:bg-green-600"
                                />
                            </div>
                        </>
                    }
                >
                    <>
                        <h2 class="text-center text-2xl font-semibold text-gray-800">Đăng nhập</h2>
                        <div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-2 text-center text-xs text-gray-500">
                            <strong>Admin:</strong> admin@mail.com / admin123<br/>
                            <strong>User:</strong> user@mail.com / user123
                        </div>
                        <div class="space-y-4">
                            <div class="flex items-center rounded-lg border border-gray-300 px-4 py-2">
                                <Icon path={envelope} class="h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    required
                                    onInput={handleChange}
                                    value={formData().email}
                                    class="w-full py-2 pl-3 outline-none"
                                />
                            </div>

                            <div class="flex items-center rounded-lg border border-gray-300 px-4 py-2">
                                <Icon path={lockClosed} class="h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Mật khẩu"
                                    required
                                    onInput={handleChange}
                                    value={formData().password}
                                    class="w-full py-2 pl-3 outline-none"
                                />
                            </div>

                            <div class="flex items-center justify-between">
                                <u class="cursor-pointer text-sm text-blue-500 hover:text-blue-600">
                                    Quên mật khẩu <Icon path={chatBubbleOvalLeft} class="inline h-4 w-4" />
                                </u>
                                <u
                                    onClick={() => setIsLogIn(false)}
                                    class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
                                >
                                    <i>Bạn chưa có tài khoản?</i>
                                </u>
                            </div>

                            <input
                                type="submit"
                                value="Đăng nhập"
                                class="w-full rounded-lg bg-blue-500 py-3 text-white transition duration-200 hover:bg-blue-600"
                            />
                        </div>
                    </>
                </Show>
            </form>
        </div>
    );
};
