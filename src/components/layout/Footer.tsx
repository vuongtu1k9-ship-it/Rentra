import { A } from "@solidjs/router";
import {
    envelope,
    lockClosed,
    user,
    xMark,
    chatBubbleOvalLeft,
    informationCircle,
} from "solid-heroicons/solid";

export const Footer = (props) => {
    const isAdmin = props.isAdmin;
    const isUser = props.isUser;
    const roles = {
        admin: {
            text: "Quản trị viên",
            icon: "shield-check",
            class: "text-red-500 font-bold",
        },
        silvers: {
            text: "Silvers",
            icon: "sparkles",
            class: "text-purple-400 font-semibold",
        },
        user: {
            text: "Thành viên",
            icon: "user",
            class: "text-green-400",
        },
        guest: {
            text: "Khách",
            icon: "user-circle",
            class: "text-gray-400",
        },
    };

    const roleKey = isAdmin ? "admin" : props.isAI ? "silvers" : isUser ? "user" : "guest";
    const r = roles[roleKey];

    const path = typeof window !== "undefined" ? window.location.pathname : "";

    const footerLinks = [
        {
            href: "/about",
            text: ["Về chúng tôi", "Liên hệ", "Điều khoản", "Cảm ơn", "Hướng dẫn", "Lời chúc"],
        },
        { href: "mailto:info@dohoanglinh03@gmail.com", text: "Gửi gmail cho Linh" },
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className="mx-full mt-12 flex transform flex-col items-center gap-8 bg-gradient-to-r from-gray-800 to-yellow-600 px-6 py-10 text-lg text-gray-100 transition-all duration-500 ease-in-out hover:scale-105 sm:px-12">
            <div className="container mx-auto px-4">
                <p
                    className={`role ${r.class} flex transform items-center space-x-2 transition-all duration-300 ease-in-out hover:scale-105`}
                >
                    <span>
                        <informationCircle class="h-6 w-6" />
                    </span>
                    <strong
                        className={`transition-colors duration-300 hover:text-white ${r.class}`}
                    >
                        {r.text}
                    </strong>
                </p>
                <p className="footer__text mt-4 text-center text-gray-300 opacity-80 transition-opacity duration-300 hover:opacity-100">
                    Cảm ơn bạn đã tin dùng!
                </p>
                <iframe
                    className="footer__map mt-6 w-full transform rounded-lg shadow-xl transition-all duration-500 ease-in-out hover:scale-105"
                    src="https://www.google.com/maps?q=Tuyen%20Quang%20Vietnam&output=embed"
                    loading="lazy"
                    allowFullScreen
                    title="Bản đồ"
                ></iframe>
                <ul className="footer__links mt-6 flex flex-wrap justify-center gap-4">
                    {footerLinks.flatMap((link) =>
                        (Array.isArray(link.text) ? link.text : [link.text]).map((t, i) => (
                            <li key={t}>
                                <A
                                    href={link.href === "/about" ? `/about#sec-${i}` : link.href}
                                    className={`transform transition-all duration-300 ${path.startsWith(link.href) && link.href !== "/" ? "translate-y-1 font-semibold text-blue-600" : "text-gray-200 hover:translate-y-1 hover:text-blue-600"}`}
                                >
                                    {t}
                                </A>
                            </li>
                        )),
                    )}
                </ul>
                <p className="footer__copyright mt-6 inline-flex items-center gap-2 text-center text-gray-200 opacity-80 transition-opacity duration-300 hover:opacity-100">
                    <informationCircle class="h-4 w-4" />
                    {currentYear} Người làm Linh. Bản quyền mọi quyền được bảo lưu.
                </p>
            </div>
        </footer>
    );
};
