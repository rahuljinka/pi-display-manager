import React from "react";

export default function DisplayLayout({ children }) {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "var(--color-background)",
                color: "var(--color-text)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                userSelect: "none",
                padding: "var(--spacing-md)",
            }}
        >
            <main style={{ flex: 1, overflowY: "auto" }}>
                {children}
            </main>
        </div>
    );
}
