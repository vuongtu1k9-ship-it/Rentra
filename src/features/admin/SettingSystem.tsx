import { createSignal } from "solid-js";

export const SettingSystem = (props) => {
    const [webName, setWebName] = createSignal(props.webName || "");
    const [adminEmail, setAdminEmail] = createSignal(props.adminEmail || "");
    const [adminPhone, setAdminPhone] = createSignal(props.adminPhone || "");
    const [color, setColor] = createSignal(props.color || "#ffffff");
    const [auto, setAuto] = createSignal(props.auto || false);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle the form update logic here (e.g., sending data to the backend)
        console.log({
            webName: webName(),
            adminEmail: adminEmail(),
            adminPhone: adminPhone(),
            color: color(),
            auto: auto(),
        });
    };
    if (props.role !== "admin") return null;
    return (
        <article class="system-settings">
            <h2 class="system-settings__header">Cấu hình hệ thống</h2>
            <form id="system-settings-form" class="system-settings__form" onSubmit={handleSubmit}>
                <fieldset class="system-settings__fieldset">
                    <label htmlFor="webName" class="system-settings__label">
                        Tên website:
                    </label>
                    <input
                        type="text"
                        id="webName"
                        value={webName()}
                        onInput={(e) => setWebName(e.target.value)}
                        class="system-settings__input"
                        placeholder="Nhập tên website"
                        required
                    />
                </fieldset>
                <fieldset class="system-settings__fieldset">
                    <label htmlFor="adminEmail" class="system-settings__label">
                        Email quản trị viên:
                    </label>
                    <input
                        type="email"
                        id="adminEmail"
                        value={adminEmail()}
                        onInput={(e) => setAdminEmail(e.target.value)}
                        class="system-settings__input"
                        placeholder="Nhập email quản trị viên"
                        required
                    />
                </fieldset>
                <fieldset class="system-settings__fieldset">
                    <label htmlFor="adminPhone" class="system-settings__label">
                        Số điện thoại quản trị viên:
                    </label>
                    <input
                        type="text"
                        id="adminPhone"
                        value={adminPhone()}
                        onInput={(e) => setAdminPhone(e.target.value)}
                        class="system-settings__input"
                        placeholder="Nhập số điện thoại quản trị viên"
                        required
                    />
                </fieldset>
                <fieldset class="system-settings__fieldset">
                    <label htmlFor="color" class="system-settings__label">
                        Màu sắc toàn bộ trang web:
                    </label>
                    <input
                        type="color"
                        id="color"
                        value={color()}
                        onInput={(e) => setColor(e.target.value)}
                        class="system-settings__input system-settings__input--color"
                    />
                </fieldset>
                <fieldset class="system-settings__fieldset">
                    <label htmlFor="auto" class="system-settings__label">
                        Tự động theo mùa:
                    </label>
                    <input
                        type="checkbox"
                        id="auto"
                        checked={auto()}
                        onChange={() => setAuto(!auto())}
                        class="system-settings__input"
                    />
                </fieldset>
                <button type="submit" class="system-settings__button">
                    Cập nhật
                </button>
            </form>
        </article>
    );
};
