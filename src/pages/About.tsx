
export const About = () => {
    return (
        <>
            <div className="container mx-auto my-8 rounded-lg bg-white p-8 text-gray-800 shadow-md">
                <h1 className="mb-6 text-center text-4xl font-bold text-blue-700">Giới thiệu</h1>
                <p className="mb-12 text-center text-lg text-gray-600">
                    Ứng dụng Solid.js SSR với Fastify
                </p>

                <section id="sec-0" className="mb-12 border-t border-gray-200 pt-8">
                    <h2 className="mb-4 text-2xl font-semibold text-blue-600">Về chúng tôi</h2>
                    <p className="leading-relaxed">
                        Chúng tôi là đội ngũ phát triển đam mê xây dựng các sản phẩm tuyệt vời, tối
                        ưu hiệu suất và mang lại trải nghiệm tốt nhất cho người dùng.
                    </p>
                </section>

                <section id="sec-1" className="mb-12 border-t border-gray-200 pt-8">
                    <h2 className="mb-4 text-2xl font-semibold text-blue-600">Liên hệ</h2>
                    <p className="leading-relaxed">
                        Bạn có thể liên hệ với chúng tôi bất cứ lúc nào qua email:{" "}
                        <strong>info@dohoanglinh03@gmail.com</strong>
                    </p>
                </section>

                <section id="sec-2" className="mb-12 border-t border-gray-200 pt-8">
                    <h2 className="mb-4 text-2xl font-semibold text-blue-600">
                        Điều khoản sử dụng
                    </h2>
                    <p className="leading-relaxed">
                        Bằng việc sử dụng ứng dụng, bạn đồng ý với các chính sách và điều khoản
                        chung của chúng tôi nhằm đảm bảo môi trường mạng an toàn.
                    </p>
                </section>

                <section id="sec-3" className="mb-12 border-t border-gray-200 pt-8">
                    <h2 className="mb-4 text-2xl font-semibold text-blue-600">Cảm ơn</h2>
                    <p className="leading-relaxed">
                        Xin chân thành cảm ơn bạn đã tin tưởng và sử dụng ứng dụng. Sự ủng hộ của
                        bạn là động lực lớn lao của chúng tôi!
                    </p>
                </section>

                <section id="sec-4" className="mb-12 border-t border-gray-200 pt-8">
                    <h2 className="mb-4 text-2xl font-semibold text-blue-600">Hướng dẫn sử dụng</h2>
                    <p className="leading-relaxed">
                        Hãy khám phá các tính năng trên thanh công cụ để trải nghiệm toàn bộ tiện
                        ích mà chúng tôi cung cấp.
                    </p>
                </section>

                <section id="sec-5" className="mb-12 border-t border-gray-200 pt-8">
                    <h2 className="mb-4 text-2xl font-semibold text-blue-600">Lời chúc</h2>
                    <p className="leading-relaxed">
                        Chúc bạn một ngày làm việc hiệu quả, tràn đầy năng lượng và luôn thành công
                        trong công việc!
                    </p>
                </section>
            </div>
        </>
    );
};
