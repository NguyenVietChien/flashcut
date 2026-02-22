import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FlashCut.ai — AI Video Automation cho CapCut";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #0a0e17 0%, #131a2e 50%, #0f1623 100%)",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "24px",
                    }}
                >
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #00d4aa, #00b4d8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "28px",
                        }}
                    >
                        ⚡
                    </div>
                    <span
                        style={{
                            fontSize: "48px",
                            fontWeight: 800,
                            color: "#ffffff",
                        }}
                    >
                        Flash
                        <span style={{ color: "#00d4aa" }}>Cut</span>
                        .ai
                    </span>
                </div>
                <p
                    style={{
                        fontSize: "28px",
                        color: "rgba(255,255,255,0.7)",
                        maxWidth: "700px",
                        textAlign: "center",
                        lineHeight: 1.4,
                    }}
                >
                    AI Video Automation cho CapCut — Tạo video nhanh gấp 60x
                </p>
                <div
                    style={{
                        marginTop: "32px",
                        padding: "12px 32px",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, #00d4aa, #00b4d8)",
                        color: "#0a0e17",
                        fontWeight: 700,
                        fontSize: "20px",
                    }}
                >
                    Dùng Thử Ngay →
                </div>
            </div>
        ),
        { ...size }
    );
}
