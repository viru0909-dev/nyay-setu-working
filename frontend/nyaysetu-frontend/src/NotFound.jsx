import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#060816",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                color: "white",
                textAlign: "center",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    maxWidth: "700px",
                }}
            >
                <h1
                    style={{
                        fontSize: "7rem",
                        fontWeight: "900",
                        marginBottom: "1rem",
                        background: "linear-gradient(90deg, #7c5cff, #4da8ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    404
                </h1>

                <h2
                    style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        marginBottom: "1rem",
                    }}
                >
                    Page Not Found
                </h2>

                <p
                    style={{
                        color: "#b0b7d1",
                        lineHeight: "1.8",
                        marginBottom: "2rem",
                        fontSize: "1.05rem",
                    }}
                >
                    The page you are looking for does not exist or may have
                    been moved. Please return to the homepage and continue
                    exploring NyaySetu.
                </p>

                <Link to="/">
                    <button
                        style={{
                            background:
                                "linear-gradient(90deg, #7c5cff, #4da8ff)",
                            border: "none",
                            padding: "1rem 2rem",
                            borderRadius: "12px",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "1rem",
                            cursor: "pointer",
                            transition: "0.3s",
                        }}
                    >
                        Return to Homepage
                    </button>
                </Link>
            </motion.div>
        </div>
    );
}