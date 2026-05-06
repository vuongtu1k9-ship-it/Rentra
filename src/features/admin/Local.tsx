import { Icon } from "solid-heroicons";
import {
    map,
    mapPin,
    arrowPath,
    arrowUpTray,
    cloudArrowUp,
    document as documentIcon,
    trash,
    circleStack,
    documentCheck,
} from "solid-heroicons/solid";
import { onMount, createSignal, For, Show } from "solid-js";

export const Local = (props) => {
    if (props.role !== "admin") return null;

    const [isDragOver, setIsDragOver] = createSignal(false);
    const [selectedFile, setSelectedFile] = createSignal(null);
    const [uploading, setUploading] = createSignal(false);
    const [message, setMessage] = createSignal("");

    const menu = [
        { title: "Bản đồ nền", description: "Quản lý lớp bản đồ", icon: map },
        { title: "Khu vực", description: "Vùng hành chính", icon: mapPin },
        { title: "Đồng bộ", description: "Cập nhật dữ liệu", icon: arrowPath },
    ];
    const processData = [
        ["Mã tiến trình", "1"],
        ["Tên tiến trình", "Quản lý địa lý trong hệ thống"],
        ["Mô tả", "Admin quản lý dữ liệu phường, xã, huyện trong hệ thống GIS"],
        ["Dữ liệu vào", "Shapefile (.shp), GeoJSON hoặc dữ liệu QGIS"],
        ["Dữ liệu ra", "Bản đồ hành chính hiển thị trên web"],
        ["Xử lý", "Admin nhập dữ liệu, chỉnh sửa lớp bản đồ và đồng bộ"],
    ];

    const processFile = (file) => {
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        const allowedExt = ["shp", "geojson"];
        if (!allowedExt.includes(ext)) {
            alert("Vui lòng chọn file shapefile (.shp) hoặc GeoJSON (.geojson) hợp lệ!");
            return;
        }
        setSelectedFile(file);
        setMessage("");
    };

    const handleFileSelect = (e) => processFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        processFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile()) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile());
        try {
            const response = await fetch("/api/upload", { method: "POST", body: formData });
            if (response.ok) {
                setMessage("Tải dữ liệu GIS thành công!");
                setSelectedFile(null);
            } else {
                setMessage("Tải lên thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Lỗi kết nối máy chủ.");
        } finally {
            setUploading(false);
        }
    };

    onMount(async () => {
        try {
            const { json_HongSon34 } = await import("../../../../server/src/db/HongSon34.js");
            const mapContainer = L.map("map").setView([22.3, 105.2], 8);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapContainer);
            
            L.geoJSON(json_HongSon34.features, {
                onEachFeature: (feature, layer) => {
                    const { ten_xa, ma_xa, sap_nhap, tru_so, loai, dtich_km2, dan_so, matdo_km2, ten_tinh } = feature.properties;
                    layer.bindPopup(`
                        <h3>${ten_xa}</h3>
                        <p><strong>Mã xã:</strong> ${ma_xa}</p>
                        <p><strong>Trụ sở:</strong> ${tru_so}</p>
                        <p><strong>Diện tích:</strong> ${dtich_km2} km²</p>
                        <p><strong>Dân số:</strong> ${dan_so}</p>
                        <p><strong>Mật độ/km²:</strong> ${matdo_km2}</p>
                        <p><strong>Loại:</strong> ${loai}</p>
                        <p><strong>Tỉnh:</strong> ${ten_tinh}</p>
                        <p><strong>Các xã/phường lân cận:</strong> ${sap_nhap}</p>
                    `);
                },
            }).addTo(mapContainer);
        } catch (e) {
            console.warn("Map data not loaded:", e);
        }
    });

    return (
        <article class="local mx-auto max-w-7xl space-y-12 p-4 sm:p-8">
            <header class="local-header flex items-center gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <div class="rounded-2xl bg-yellow-50 p-4 text-yellow-600">
                    <Icon path={map} class="h-10 w-10" />
                </div>
                <div>
                    <h1 class="text-3xl font-extrabold text-gray-800">Quản lý địa lý hành chính</h1>
                    <p class="font-medium text-gray-500">Quản lý dữ liệu GIS và bản đồ hệ thống</p>
                </div>
            </header>

            <section class="menu-grid grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                {menu?.map(({ title, description, icon }) => (
                    <div class="menu-card group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-gray-50 bg-white p-6 text-center shadow-sm transition-all hover:border-yellow-200 hover:shadow-md">
                        <Icon
                            path={icon}
                            class="h-8 w-8 text-gray-400 transition-colors group-hover:text-yellow-500"
                        />
                        <div>
                            <h3 class="text-sm font-bold text-gray-700">{title ?? "N/A"}</h3>
                            <p class="mt-1 line-clamp-1 text-[10px] text-gray-400">
                                {description ?? ""}
                            </p>
                        </div>
                    </div>
                ))}
            </section>

            <div class="grid gap-8 lg:grid-cols-3">
                <div class="space-y-8 lg:col-span-2">
                    <section class="map-section relative h-[600px] overflow-hidden rounded-3xl border border-gray-100 bg-white p-2 shadow-lg">
                        <div id="map" class="h-full w-full rounded-2xl"></div>
                    </section>
                </div>

                <div class="space-y-8">
                    <section class="card space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                        <h2 class="flex items-center gap-2 text-xl font-bold text-gray-800">
                            <Icon path={arrowUpTray} class="h-5 w-5 text-blue-500" />
                            Tải dữ liệu GIS
                        </h2>

                        <div
                            class={`group relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${isDragOver() ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50"}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragOver(true);
                            }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <div class="pointer-events-none flex flex-col items-center justify-center space-y-4">
                                <Icon path={cloudArrowUp} class="h-5 w-5" />
                                <div class="text-sm">
                                    <p class="font-bold text-gray-700">
                                        Kéo thả Shapefile hoặc GeoJSON
                                    </p>
                                    <p class="mt-1 text-gray-400">hoặc nhấp để chọn tệp</p>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept=".shp,.geojson"
                                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                onChange={handleFileSelect}
                            />
                        </div>

                        <Show when={selectedFile()}>
                            <div class="animate-in slide-in-from-top-2 flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                <div class="flex items-center gap-3 overflow-hidden">
                                    <Icon
                                        path={documentIcon}
                                        class="h-8 w-8 flex-shrink-0 text-blue-500"
                                    />
                                    <div class="truncate text-left">
                                        <p class="truncate text-sm font-bold text-gray-800">
                                            {selectedFile().name}
                                        </p>
                                        <p class="text-[10px] text-gray-500">
                                            {(selectedFile().size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    class="rounded-full p-2 text-gray-400 transition-all hover:bg-white hover:text-red-500"
                                >
                                    <Icon path={trash} class="h-5 w-5" />
                                </button>
                            </div>
                        </Show>

                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile() || uploading()}
                            class={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold shadow-lg transition-all ${!selectedFile() || uploading() ? "cursor-not-allowed bg-gray-100 text-gray-400 shadow-none" : "bg-blue-600 text-white shadow-blue-100 hover:-translate-y-1 hover:bg-blue-700 active:translate-y-0"}`}
                        >
                            <Icon
                                path={uploading() ? arrowUpTray : documentCheck}
                                class={`h-5 w-5 ${uploading() ? "animate-bounce" : ""}`}
                            />
                            {uploading() ? "Đang xử lý..." : "Tải lên ngay"}
                        </button>

                        <Show when={message()}>
                            <p
                                class={`rounded-full px-4 py-2 text-center text-xs font-bold ${message().includes("thành công") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                            >
                                {message()}
                            </p>
                        </Show>
                    </section>

                    <section class="card rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                        <h2 class="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
                            <Icon path={circleStack} class="h-5 w-5 text-gray-400" />
                            Tiến trình
                        </h2>
                        <div class="space-y-4">
                            {processData?.map(([label, value]) => (
                                <div class="flex items-start justify-between gap-4 border-b border-gray-50 pb-4 last:border-0">
                                    <span class="w-1/3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        {label}
                                    </span>
                                    <span class="w-2/3 text-right text-sm font-semibold text-gray-700">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </article>
    );
};
