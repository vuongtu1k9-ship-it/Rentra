import { createSignal, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { chatBubbleLeft, xMark } from "solid-heroicons/solid";

export const Silver = () => {
    const [chat, setChat] = createSignal([]);
    const [isOpen, setIsOpen] = createSignal(false);

    // Xử lý sự kiện gửi tin nhắn
    const handleSubmit = async (e) => {
        e.preventDefault();
        const input = e.target.elements.query.value.trim(); // Lấy input từ form
        if (!input) return; // Nếu không có nhập liệu thì dừng lại

        // Thêm tin nhắn của người dùng vào trạng thái chat
        setChat((prevChat) => [
            ...prevChat,
            { text: input, isUser: true },
            { text: "...", isUser: false, isLoading: true }, // Hiển thị trạng thái đang gõ
        ]);
        e.target.reset(); // Reset form sau khi gửi

        const messagesPayload = [
            {
                role: "system",
                content:
                    "Bạn tên là Silver. Bạn là một trợ lý AI thông minh, thân thiện và đáng tin cậy của ứng dụng Rentra. Hãy trả lời ngắn gọn và bằng tiếng Việt.",
            },
            // Lịch sử chat (để AI nhớ ngữ cảnh)
            ...chat()
                .filter((msg) => !msg.isLoading)
                .map((msg) => ({
                    role: msg.isUser ? "user" : "assistant",
                    content: msg.text,
                })),
            { role: "user", content: input },
        ];

        // Gọi API nội bộ của Backend (Tránh lộ API Key)
        try {
            const response = await fetch("/api/silver/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: messagesPayload }),
            });

            if (!response.ok) throw new Error("API lỗi");

            const data = await response.json();
            const aiMessage =
                data.choices?.[0]?.message?.content ||
                "Xin lỗi, não bộ AI của tôi đang gặp trục trặc chút xíu.";

            // Cập nhật lại màn hình (xóa dòng "..." và thay bằng câu trả lời)
            setChat((prevChat) => {
                const newChat = prevChat.filter((msg) => !msg.isLoading);
                return [...newChat, { text: aiMessage, isUser: false }];
            });
        } catch (error) {
            console.error("Lỗi AI:", error);
            setChat((prevChat) => {
                const newChat = prevChat.filter((msg) => !msg.isLoading);
                return [
                    ...newChat,
                    {
                        text: "Lỗi kết nối tới não bộ AI (Vui lòng kiểm tra lại Key hoặc mạng).",
                        isUser: false,
                    },
                ];
            });
        }
    };

    // Xử lý sự kiện reset form
    const handleReset = (e) => {
        e.preventDefault();
        e.target.form.reset();
    };

    return (
        <div class="fixed bottom-6 right-6 z-50">
            {/* Floating Action Button */}
            <Show when={!isOpen()}>
                <button
                    onClick={() => setIsOpen(true)}
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition-transform hover:scale-110 active:scale-95"
                    aria-label="Mở khung chat AI"
                >
                    <Icon path={chatBubbleLeft} class="h-7 w-7" />
                </button>
            </Show>

            {/* Chat Frame */}
            <Show when={isOpen()}>
                <aside id="model" class="w-[350px] max-w-[calc(100vw-3rem)] space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
                    <div class="flex items-center justify-between border-b pb-2">
                        <div class="flex items-center gap-2">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <Icon path={chatBubbleLeft} class="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 class="font-bold text-gray-800">Trợ lý ảo Silver</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <Icon path={xMark} class="h-5 w-5" />
                        </button>
                    </div>
            <div
                className="ai-result max-h-96 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-2"
                role="log"
                aria-live="polite"
            >
                {/* Hiển thị các tin nhắn */}
                {chat().map((msg, i) => (
                    <div className={`flex w-full ${msg.isUser ? "justify-end" : "justify-start"} items-end space-x-2`} key={i}>
                        {!msg.isUser && (
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                                <Icon path={chatBubbleLeft} class="h-5 w-5 text-yellow-600" />
                            </div>
                        )}
                        <div
                            className={
                                msg.isUser
                                    ? "max-w-xs break-words rounded-2xl rounded-br-sm bg-blue-500 px-4 py-2 text-white"
                                    : "max-w-xs whitespace-pre-line break-words rounded-2xl rounded-bl-sm bg-gray-200 px-4 py-2 text-gray-800"
                            }
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Form nhập liệu */}
            <form
                className="ai-form flex items-center space-x-2"
                role="search"
                aria-label="Chat input form"
                onSubmit={handleSubmit}
            >
                <input
                    name="query"
                    type="text"
                    placeholder="Nhập câu hỏi..."
                    required
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2"
                />
                <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white transition hover:bg-blue-600"
                >
                    Hỏi trợ lý
                </button>
                <button
                    type="reset"
                    className="rounded-lg bg-gray-500 px-4 py-2 font-bold text-white transition hover:bg-gray-600"
                    onClick={handleReset}
                >
                    Xóa
                </button>
            </form>
                </aside>
            </Show>
        </div>
    );
};

export default function Agent() {
    const [engine, setEngine] = createSignal(null);
    const [messages, setMessages] = createSignal([]);
    const [input, setInput] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [loadProgress, setLoadProgress] = createSignal("");
    const [isReady, setIsReady] = createSignal(false);
    const [streaming, setStreaming] = createSignal("");

    // Kiểm tra WebGPU có được hỗ trợ không
    const webgpuSupported = typeof navigator !== "undefined" && !!navigator.gpu;

    // Load model vào WebGPU
    async function loadModel() {
        if (!webgpuSupported) return;
        setLoading(true);
        try {
            const e = await CreateMLCEngine(MODEL_ID, {
                initProgressCallback: (p) => {
                    setLoadProgress(`Đang tải model: ${Math.round(p.progress * 100)}% — ${p.text}`);
                },
            });
            setEngine(e);
            setIsReady(true);
            setLoadProgress("✅ Model sẵn sàng!");
        } catch (err) {
            setLoadProgress(`❌ Lỗi: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage() {
        const text = input().trim();
        if (!text || !engine()) return;

        const newMessages = [...messages(), { role: "user", content: text }];
        setMessages(newMessages);
        setInput("");
        setStreaming("");

        const chunks = await engine().chat.completions.create({
            messages: newMessages,
            stream: true,
            temperature: 1,
        });

        let reply = "";
        for await (const chunk of chunks) {
            const delta = chunk.choices[0]?.delta?.content || "";
            reply += delta;
            setStreaming(reply);
        }

        setMessages([...newMessages, { role: "assistant", content: reply }]);
        setStreaming("");
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <div
            style={{
                display: "flex",
                "flex-direction": "column",
                height: "100%",
                "font-family": "sans-serif",
                "max-width": "720px",
                margin: "0 auto",
                padding: "1rem",
            }}
        >
            <h2>🤖 Agent AI (WebGPU — {MODEL_ID})</h2>

            <Show when={!webgpuSupported}>
                <p style={{ color: "red" }}>
                    ❌ Trình duyệt của bạn chưa hỗ trợ WebGPU. Hãy dùng Chrome 113+.
                </p>
            </Show>

            <Show when={webgpuSupported && !isReady()}>
                <div>
                    <p style={{ color: "#888" }}>{loadProgress() || "Model chưa được tải."}</p>
                    <button
                        onClick={loadModel}
                        disabled={loading()}
                        style={{
                            padding: "0.5rem 1.5rem",
                            background: "#6366f1",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: loading() ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading() ? "⏳ Đang tải..." : "🚀 Tải Model (WebGPU)"}
                    </button>
                </div>
            </Show>

            <Show when={isReady()}>
                {/* Khung chat */}
                <div
                    style={{
                        flex: 1,
                        "overflow-y": "auto",
                        border: "1px solid #e5e7eb",
                        "border-radius": "10px",
                        padding: "1rem",
                        "margin-bottom": "1rem",
                        "min-height": "300px",
                        background: "#f9fafb",
                    }}
                >
                    {messages().map((m, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                "justify-content": m.role === "user" ? "flex-end" : "flex-start",
                                "margin-bottom": "0.75rem",
                            }}
                        >
                            <div
                                style={{
                                    "max-width": "80%",
                                    padding: "0.6rem 1rem",
                                    background: m.role === "user" ? "#6366f1" : "#fff",
                                    color: m.role === "user" ? "#fff" : "#111",
                                    "border-radius":
                                        m.role === "user"
                                            ? "16px 16px 4px 16px"
                                            : "16px 16px 16px 4px",
                                    "box-shadow": "0 1px 3px rgba(0,0,0,0.1)",
                                    "white-space": "pre-wrap",
                                }}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}

                    {/* Đang stream response */}
                    <Show when={streaming()}>
                        <div
                            style={{
                                display: "flex",
                                "justify-content": "flex-start",
                                "margin-bottom": "0.75rem",
                            }}
                        >
                            <div
                                style={{
                                    "max-width": "80%",
                                    padding: "0.6rem 1rem",
                                    background: "#fff",
                                    "border-radius": "16px 16px 16px 4px",
                                    "box-shadow": "0 1px 3px rgba(0,0,0,0.1)",
                                    "white-space": "pre-wrap",
                                }}
                            >
                                {streaming()}
                                <span style={{ animation: "blink 1s infinite" }}>▌</span>
                            </div>
                        </div>
                    </Show>
                </div>
                archiveBox
                {/* Input */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <textarea
                        value={input()}
                        onInput={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn... (Enter để gửi)"
                        rows={2}
                        style={{
                            flex: 1,
                            padding: "0.6rem",
                            "border-radius": "8px",
                            border: "1px solid #d1d5db",
                            resize: "none",
                            "font-size": "1rem",
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input().trim() || streaming()}
                        style={{
                            padding: "0 1.5rem",
                            background: "#6366f1",
                            color: "#fff",
                            border: "none",
                            "border-radius": "8px",
                            cursor: !input().trim() || streaming() ? "not-allowed" : "pointer",
                        }}
                    >
                        Gửi
                    </button>
                </div>
            </Show>
        </div>
    );
}
