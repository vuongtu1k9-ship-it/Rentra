import { onMount } from "solid-js";

export default function HeavyChart(props) {
    onMount(() => {
        console.log("HeavyChart mounted - lazy loaded");
    });

    return (
        <div class="rounded-lg bg-white p-6 shadow-md">
            <h3 class="mb-4 text-xl font-semibold text-gray-800">Biểu đồ phức tạp</h3>
            <div class="flex h-48 items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-teal-400">
                <p class="font-medium text-white">Chart: {props.data || "No data"}</p>
            </div>
            <p class="mt-2 text-sm text-gray-600">
                Component này được load động khi cần (Code Splitting)
            </p>
        </div>
    );
}
