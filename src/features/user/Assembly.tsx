import { createSignal, createEffect, Show, For, onCleanup } from "solid-js";
import { Icon } from "solid-heroicons";
import {
    pencil, paintBrush, handThumbDown, handThumbUp, heart, megaphone, videoCamera, link,
    power, userGroup, handRaised, ellipsisHorizontal, chatBubbleLeftRight, signal, slash, paperAirplane,
    scale, documentArrowDown
} from "solid-heroicons/solid";

export const Assembly = (props) => {
    if (props.role !== "admin" && props.role !== "user") return null;

    const [isMuted, setIsMuted] = createSignal(false);
    const [isVideoOff, setIsVideoOff] = createSignal(false);
    const [isHandRaised, setIsHandRaised] = createSignal(false);
    const [activeTab, setActiveTab] = createSignal("participants"); // 'participants' | 'chat'
    const [showMoreMenu, setShowMoreMenu] = createSignal(false);
    const [meetingName, setMeetingName] = createSignal("");
    const [isMeetingActive, setIsMeetingActive] = createSignal(false);

    // --- Whiteboard State ---
    const [showWhiteboard, setShowWhiteboard] = createSignal(false);
    let canvasRef;
    let isDrawing = false;
    let ctx;

    const startDrawing = (e) => {
        isDrawing = true;
        draw(e);
    };

    const stopDrawing = () => {
        isDrawing = false;
        if (ctx) ctx.beginPath();
    };

    const draw = (e) => {
        if (!isDrawing || !ctx || !canvasRef) return;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#3B82F6"; // Blue color

        const rect = canvasRef.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    createEffect(() => {
        if (showWhiteboard() && canvasRef) {
            ctx = canvasRef.getContext("2d");
            // Set canvas resolution to match display size
            canvasRef.width = canvasRef.offsetWidth;
            canvasRef.height = canvasRef.offsetHeight;
        }
    });

    // --- WebSocket Chat State ---
    const [messages, setMessages] = createSignal([]);
    const [chatInput, setChatInput] = createSignal("");
    let ws;

    const startMeeting = () => {
        if (!meetingName().trim()) return alert("Vui lòng nhập tên cuộc họp");
        setIsMeetingActive(true);

        // Khởi tạo kết nối WebSocket
        ws = new WebSocket(`ws://localhost:3000/api/ws/meeting/${encodeURIComponent(meetingName().trim())}`);

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                setMessages(prev => [...prev, msg]);
            } catch (e) {
                console.error("Lỗi parse tin nhắn:", e);
            }
        };
    };

    const sendMessage = () => {
        if (!chatInput().trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

        const newMsg = {
            sender: props.role === "admin" ? "Admin" : "User",
            text: chatInput().trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        ws.send(JSON.stringify(newMsg));
        setChatInput("");
    };

    const leaveMeeting = () => {
        setIsMeetingActive(false);
        if (ws) ws.close();
        setMessages([]);
    };

    onCleanup(() => {
        if (ws) ws.close();
    });

    const participants = [
        { id: 1, name: "Bạn", isSpeaking: true, role: "admin" },
        { id: 2, name: "Trần Văn A", isSpeaking: false, role: "user" },
        { id: 3, name: "Lê Thị B", isSpeaking: false, role: "user" },
        { id: 4, name: "Nguyễn Văn C", isSpeaking: false, role: "guest" },
    ];

    return (
        <Show when={["admin", "user"].includes(props.role)}>
            <Show when={!isMeetingActive()}>
                {/* Google Meet Style Landing Page */}
                <div class="flex h-[calc(100vh-120px)] items-center justify-between bg-white px-8 lg:px-24 text-gray-900">
                    <div class="flex max-w-xl flex-col gap-8">
                        <h1 class="text-4xl font-normal leading-tight lg:text-5xl">
                            Cuộc họp video và cuộc gọi chất lượng cao dành cho mọi người
                        </h1>
                        <p class="text-xl font-light text-gray-600">
                            Kết nối, cộng tác và ăn mừng từ mọi nơi với Rentra Assembly.
                        </p>

                        <div class="mt-4 flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => {
                                    const randomId = Math.random().toString(36).substring(2, 9);
                                    setMeetingName(`meet-${randomId}`);
                                    startMeeting();
                                }}
                                class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                            >
                                <Icon path={videoCamera} class="h-5 w-5" />
                                Cuộc họp mới
                            </button>

                            <div class="flex items-center gap-2">
                                <div class="relative flex items-center">
                                    <Icon path={link} class="absolute left-3 h-5 w-5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Nhập mã hoặc đường link"
                                        value={meetingName()}
                                        onInput={(e) => setMeetingName(e.target.value)}
                                        class="w-64 rounded-md border border-gray-400 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-800 outline-none transition-all placeholder:font-normal placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                                <button
                                    onClick={startMeeting}
                                    disabled={!meetingName().trim()}
                                    class="rounded-md px-4 py-3 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent"
                                >
                                    Tham gia
                                </button>
                            </div>
                        </div>

                        <div class="mt-8 border-t border-gray-200 pt-6">
                            <p class="text-sm text-gray-600">
                                <a href="#" class="text-blue-600 hover:underline">Tìm hiểu thêm</a> về Assembly
                            </p>
                        </div>
                    </div>

                    {/* Carousel / Image Placeholder */}
                    <div class="hidden flex-1 items-center justify-center lg:flex">
                        <div class="flex flex-col items-center text-center">
                            <div class="mb-8 flex h-72 w-72 items-center justify-center rounded-full bg-blue-50">
                                <Icon path={userGroup} class="h-32 w-32 text-blue-500" />
                            </div>
                            <h2 class="text-2xl font-normal">Nhận đường liên kết bạn có thể chia sẻ</h2>
                            <p class="mt-2 text-sm text-gray-600 max-w-sm">
                                Nhấp vào <strong>Cuộc họp mới</strong> để nhận đường liên kết bạn có thể gửi cho những người mình muốn họp cùng
                            </p>
                        </div>
                    </div>
                </div>
            </Show>

            <Show when={isMeetingActive()}>
                {/* Meeting Layout */}
                <div class="flex h-[calc(100vh-120px)] w-full overflow-hidden bg-gray-900 shadow-2xl lg:flex-row">
                    {/* Main Video Area */}
                    <div class="relative flex flex-1 flex-col p-4">
                        <div class="flex items-center justify-between px-2 pb-4 text-white">
                            <div>
                                <h2 class="text-xl font-bold">{meetingName() || "Họp Nhóm Chiến Lược"}</h2>
                                <p class="text-xs text-gray-400">
                                    Đang diễn ra • 00:45:12
                                </p>
                            </div>
                        </div>

                        <div class="relative flex-1 flex flex-col min-h-0">
                            <Show when={showWhiteboard()}>
                                <div class="absolute inset-0 z-10 flex flex-col rounded-2xl bg-white p-4">
                                    <div class="mb-4 flex items-center justify-between">
                                        <h3 class="text-lg font-bold text-gray-800">Bảng trắng chung</h3>
                                        <button
                                            onClick={() => setShowWhiteboard(false)}
                                            class="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
                                        >
                                            Đóng bảng
                                        </button>
                                    </div>
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseUp={stopDrawing}
                                        onMouseMove={draw}
                                        onMouseLeave={stopDrawing}
                                        class="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-crosshair w-full h-full touch-none"
                                    ></canvas>
                                </div>
                            </Show>

                            <div class={`grid flex-1 grid-cols-2 gap-4 ${showWhiteboard() ? 'hidden' : ''}`}>
                                <For each={participants}>
                                    {(user) => (
                                        <div class={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gray-800 ${user.isSpeaking ? 'ring-4 ring-blue-500' : 'border border-gray-700'}`}>
                                            <div class="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-md">
                                                <span class="text-sm font-medium text-white">{user.name}</span>
                                                {user.isSpeaking && (
                                                    <Icon path={signal} class="h-4 w-4 text-white" />
                                                )}
                                            </div>
                                            <div class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl font-bold text-white shadow-lg">
                                                {user.name.charAt(0)}
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center justify-center gap-4 rounded-2xl bg-gray-800/80 px-6 py-4 backdrop-blur-xl">
                            <button
                                onClick={() => setIsMuted(!isMuted())}
                                class={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all ${isMuted() ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <Icon path={megaphone} class="h-5 w-5 text-white" />
                                {isMuted() && (
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <Icon path={slash} class="h-6 w-6 text-black" />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => setIsVideoOff(!isVideoOff())}
                                class={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all ${isVideoOff() ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <Icon path={videoCamera} class="h-5 w-5 text-white" />
                                {isVideoOff() && (
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <Icon path={slash} class="h-6 w-6 text-black" />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => setIsHandRaised(!isHandRaised())}
                                class={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${isHandRaised() ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <Icon path={handRaised} class="h-5 w-5 text-white" />
                            </button>

                            <div class="relative">
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu())}
                                    class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 transition-all hover:bg-gray-600"
                                >
                                    <Icon path={ellipsisHorizontal} class="h-5 w-5 text-white" />
                                </button>

                                {/* Dropdown Menu */}
                                <Show when={showMoreMenu()}>
                                    <div class="absolute bottom-full left-1/2 mb-4 -translate-x-1/2 w-48 rounded-2xl bg-gray-800 p-2 shadow-xl border border-gray-700 z-10">
                                        Công cụ
                                        <button
                                            onClick={() => { setShowWhiteboard(true); setShowMoreMenu(false); }}
                                            class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700">
                                            <Icon path={pencil} class="h-4 w-4 text-orange-400" />
                                            Dùng bút
                                        </button>
                                        <button class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700">
                                            <Icon path={paintBrush} class="h-4 w-4 text-purple-400" />
                                            Đổi nền
                                        </button>
                                        <button class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700">
                                            <Icon path={scale} class="h-4 w-4 text-purple-400" />
                                            Thương lượng
                                        </button>
                                        Cảm xúc
                                        <button class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700">
                                            <Icon path={heart} class="h-4 w-4 text-red-500" />
                                            Thả tim
                                        </button>
                                        <button class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700">
                                            <Icon path={handThumbUp} class="h-4 w-4 text-green-400" />
                                            Đồng ý
                                        </button>
                                        <button class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700">
                                            <Icon path={handThumbDown} class="h-4 w-4 text-yellow-500" />
                                            Không đồng ý
                                        </button>
                                    </div>
                                </Show>
                            </div>

                            <div class="h-8 w-px bg-gray-600"></div>

                            <button
                                onClick={leaveMeeting}
                                class="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30"
                            >
                                <Icon path={power} class="h-5 w-5" />
                                Rời phòng
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div class="flex w-full flex-col border-l border-gray-800 bg-gray-900 lg:w-80">
                        <div class="flex border-b border-gray-800">
                            <button
                                onClick={() => setActiveTab("participants")}
                                class={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab() === "participants" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-gray-200"}`}
                            >
                                <div class="flex items-center justify-center gap-2">
                                    <Icon path={userGroup} class="h-4 w-4" />
                                    Người tham gia (4)
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("chat")}
                                class={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab() === "chat" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-gray-200"}`}
                            >
                                <div class="flex items-center justify-center gap-2">
                                    <Icon path={chatBubbleLeftRight} class="h-4 w-4" />
                                    Trò chuyện
                                </div>
                            </button>
                        </div>
                        <div class="flex flex-1 flex-col overflow-hidden">
                            <Show when={activeTab() === "participants"}>
                                <div class="flex-1 overflow-y-auto p-4 space-y-4">
                                    <For each={participants}>
                                        {(user) => (
                                            <div class="flex items-center justify-between rounded-xl bg-gray-800/50 p-3">
                                                <div class="flex items-center gap-3">
                                                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-white">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p class="text-sm font-medium text-white">{user.name}</p>
                                                        <p class="text-xs text-gray-400 capitalize">{user.role}</p>
                                                    </div>
                                                </div>
                                                <div class="flex gap-2">
                                                    <Icon path={megaphone} class="h-4 w-4 text-gray-500" />
                                                    <Icon path={videoCamera} class="h-4 w-4 text-gray-500" />
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </Show>

                            <Show when={activeTab() === "chat"}>
                                <div class="flex flex-1 flex-col bg-gray-900">
                                    {/* Chat Messages */}
                                    <div class="flex flex-1 flex-col p-4 overflow-y-auto">
                                        <Show
                                            when={messages().length > 0}
                                            fallback={
                                                <div class="flex h-full flex-col items-center justify-center">
                                                    <Icon path={chatBubbleLeftRight} class="mx-auto mb-4 h-12 w-12 text-gray-700" />
                                                    <p class="text-gray-500 italic">Chưa có tin nhắn nào</p>
                                                </div>
                                            }>
                                            <div class="flex flex-col gap-4">
                                                <For each={messages()}>
                                                    {(msg) => (
                                                        <div class="flex flex-col">
                                                            <div class="flex items-baseline gap-2 mb-1">
                                                                <span class="text-sm font-bold text-blue-400">{msg.sender}</span>
                                                                <span class="text-xs text-gray-500">{msg.time}</span>
                                                            </div>
                                                            <div class="rounded-2xl rounded-tl-none bg-gray-800 px-4 py-2 text-sm text-gray-200 w-fit max-w-[90%]">
                                                                {msg.text}
                                                            </div>
                                                        </div>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>
                                    </div>

                                    {/* Chat Input */}
                                    <div class="border-t border-gray-800 p-4">
                                        <div class="relative flex items-center">
                                            <input
                                                type="text"
                                                placeholder="Nhập tin nhắn..."
                                                value={chatInput()}
                                                onInput={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                                disabled={!isMeetingActive()}
                                                class="w-full rounded-2xl border border-gray-700 bg-gray-800 py-3 pl-4 pr-12 text-sm font-medium text-white outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                            />
                                            <button>
                                                <Icon path={documentArrowDown} class="h-4 w-4" />
                                                Tải tin nhắn về
                                            </button>
                                            <button
                                                onClick={sendMessage}
                                                disabled={!isMeetingActive() || !chatInput().trim()}
                                                class="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                                                <Icon path={paperAirplane} class="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>
            </Show>
        </Show>
    );
};
