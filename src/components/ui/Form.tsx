import { xCircle, cloudArrowUp, trash } from "solid-heroicons/solid";
import { createSignal, Show, For } from "solid-js";

export const Form = (props) => {
    const [multimedia, setMultimedia] = createSignal(null);
    const [isDragOver, setIsDragOver] = createSignal(false);

    const loadMedia = async () => {
        if (props.initialData?.img?.link || props.initialData?.video?.link) {
            setMultimedia({
                link: props.initialData.img?.link || props.initialData.video?.link,
                type: props.initialData.video?.link ? "video" : "image",
            });
        }
    };
    loadMedia();

    const media = () => multimedia();
    const type = () => media()?.type;

    const processFile = (file) => {
        if (!file) return;

        const imgId = file.type.startsWith("image/");
        const videoId = file.type.startsWith("video/");

        if (props.mediaType === "image" && videoId) {
            alert("Trang này chỉ cho phép tải lên hình ảnh!");
            return;
        }

        if (!imgId && !videoId) {
            alert("Vui lòng chọn tệp hình ảnh hoặc video hợp lệ!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            setMultimedia({
                link: ev.target.result,
                type: videoId ? "video" : "image",
                file: file,
            });
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const clearMedia = () => {
        setMultimedia(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        if (media()) data.media = media();
        props.onSubmit(data);
    };

    if (!["admin", "user"].includes(props.role)) return null;

    return (
        <div class="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-300">
            <form
                class="animate-in zoom-in-95 relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl duration-300"
                onSubmit={handleSubmit}
            >
                <div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
                    <h2 class="text-xl font-bold text-gray-800">{props.title}</h2>
                    <button
                        type="button"
                        onClick={() => props.onClose?.()}
                        class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <Icon path={xCircle} class="h-6 w-6" />
                    </button>
                </div>

                <div class="space-y-4 p-6">
                    <For each={props.fields}>
                        {(field) => (
                            <fieldset class="space-y-1.5">
                                <label
                                    for={field.name}
                                    class="block text-sm font-semibold text-gray-600"
                                >
                                    {field.label}
                                </label>

                                <Show
                                    when={field.type === "textarea"}
                                    fallback={
                                        <Show
                                            when={field.type === "select"}
                                            fallback={
                                                <input
                                                    type={field.type}
                                                    id={field.name}
                                                    name={field.name}
                                                    value={props.initialData?.[field.name] ?? ""}
                                                    class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none transition-all placeholder:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                    required={field.required}
                                                    min={field.min}
                                                />
                                            }
                                        >
                                            <select
                                                id={field.name}
                                                name={field.name}
                                                value={
                                                    props.initialData?.[field.name] ??
                                                    field.options?.[0]?.value
                                                }
                                                class="w-full appearance-none rounded-xl border border-gray-200 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat px-4 py-2 outline-none transition-all focus:border-blue-500"
                                            >
                                                <For each={field.options}>
                                                    {(opt) => (
                                                        <option value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    )}
                                                </For>
                                            </select>
                                        </Show>
                                    }
                                >
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        rows={field.rows || 4}
                                        value={props.initialData?.[field.name] ?? ""}
                                        class="w-full resize-none rounded-xl border border-gray-200 px-4 py-2 outline-none transition-all placeholder:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required={field.required}
                                    />
                                </Show>
                            </fieldset>
                        )}
                    </For>
                    <Show when={props.showMedia}>
                        <div class="space-y-4 pt-2">
                            <label class="block text-sm font-semibold text-gray-600">
                                Đa phương tiện
                            </label>

                            <div
                                class={`group relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${isDragOver() ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50"}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div class="pointer-events-none flex flex-col items-center justify-center space-y-2">
                                    <Icon path={cloudArrowUp} class="h-5 w-5" />
                                    <div class="text-sm">
                                        <p class="font-bold text-gray-700">Kéo thả tệp vào đây</p>
                                        <p class="text-gray-400">
                                            hoặc nhấp để chọn{" "}
                                            {props.mediaType === "image" ? "hình ảnh" : "tệp"}
                                        </p>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    id="file"
                                    name="file"
                                    accept={
                                        props.mediaType === "image" ? "image/*" : "image/*,video/*"
                                    }
                                    class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            <Show when={media()}>
                                <div class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-2 shadow-sm">
                                    <Show
                                        when={type() === "image"}
                                        fallback={
                                            <video
                                                src={media().link}
                                                controls
                                                class="h-48 w-full rounded-xl object-contain"
                                            />
                                        }
                                    >
                                        <img
                                            src={media().link}
                                            alt="Preview"
                                            class="h-48 w-full rounded-xl object-contain"
                                        />
                                    </Show>

                                    <button
                                        type="button"
                                        onClick={clearMedia}
                                        class="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-red-500 opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-red-50 group-hover:opacity-100"
                                        title="Xóa tệp đã chọn"
                                    >
                                        <Icon path={trash} class="h-5 w-5" />
                                    </button>
                                </div>
                            </Show>
                        </div>
                    </Show>
                </div>

                <div class="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
                    <button
                        type="submit"
                        class="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:shadow-blue-300 active:translate-y-0"
                    >
                        Lưu thông tin
                    </button>
                    <button
                        type="reset"
                        onClick={clearMedia}
                        class="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-600 transition-all hover:bg-gray-200"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};
