import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import DashboardScreen from "./screens/DashboardScreen";
import InfoScreen from "./screens/InfoScreen";
import MediaScreen from "./screens/MediaScreen";
import { ThemeProvider } from "./theme/ThemeContext";
import { GlobalStyles } from "./theme/GlobalStyles";

const API = `http://${window.location.hostname}:8001`;

function App() {
    const [screen, setScreen] = useState("loading");

    async function loadScreen() {
        try {
            const response = await fetch(`${API}/screen`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setScreen(data.screen);
        }
        catch (error) {
            console.error("Screen error:", error);
            setScreen("error");
        }
    }

    useEffect(() => {
        loadScreen();
        const timer = setInterval(loadScreen, 3000);
        return () => clearInterval(timer);
    }, []);

    function renderScreen() {
        switch (screen) {
            case "dashboard":
                return <DashboardScreen />;
            case "info":
                return <InfoScreen />;
            case "media":
                return <MediaScreen />;
            case "loading":
                return (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        fontSize: "24px",
                        color: "var(--color-textSecondary)"
                    }}>
                        Loading...
                    </div>
                );
            case "error":
                return (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        fontSize: "24px",
                        color: "var(--color-error)"
                    }}>
                        Backend Connection Error
                    </div>
                );
            default:
                return (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        fontSize: "24px"
                    }}>
                        Unknown Screen: {screen}
                    </div>
                );
        }
    }

    return (
        <ThemeProvider>
            <GlobalStyles />
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    background: "var(--color-background)",
                    color: "var(--color-text)"
                }}
            >
                {renderScreen()}
            </div>
        </ThemeProvider>
    );
}

createRoot(
    document.getElementById("root")
).render(<App />);
