import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import Dashboard from "./components/Dashboard";
import Info from "./components/Info";
import Media from "./components/Media";
import SystemStats from "./components/SystemStats";
import DockerStats from "./components/DockerStats";
import MediaManager from "./components/MediaManager";
import ThemeSettings from "./components/ThemeSettings";
import { ThemeProvider } from "./theme/ThemeContext";
import { GlobalStyles } from "./theme/GlobalStyles";
import { Card, Button, SectionHeader } from "./components/ui";

const API_URL = `http://${window.location.hostname}:8001`;

function App() {
    const [screen, setScreen] = useState("dashboard");

    async function changeScreen(newScreen) {
        setScreen(newScreen);
        try {
            await fetch(`${API_URL}/screen`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ screen: newScreen })
            });
        } catch (error) {
            console.error("Backend connection failed:", error);
        }
    }

    return (
        <ThemeProvider>
            <GlobalStyles />
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "var(--spacing-lg)" }}>
                <SectionHeader 
                    title="Pi Display Manager" 
                    action={
                        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                            <Button 
                                variant={screen === "dashboard" ? "primary" : "ghost"} 
                                onClick={() => changeScreen("dashboard")}
                                size="sm"
                            >
                                Dashboard
                            </Button>
                            <Button 
                                variant={screen === "info" ? "primary" : "ghost"} 
                                onClick={() => changeScreen("info")}
                                size="sm"
                            >
                                Info
                            </Button>
                            <Button 
                                variant={screen === "media" ? "primary" : "ghost"} 
                                onClick={() => changeScreen("media")}
                                size="sm"
                            >
                                Media
                            </Button>
                            <Button 
                                variant={screen === "settings" ? "primary" : "ghost"} 
                                onClick={() => setScreen("settings")}
                                size="sm"
                            >
                                ⚙️
                            </Button>
                        </div>
                    }
                />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
                    <SystemStats />
                    <DockerStats />
                </div>

                <MediaManager />

                <SectionHeader title="Display Preview" />
                <Card style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {screen === "dashboard" && <Dashboard />}
                    {screen === "info" && <Info />}
                    {screen === "media" && <Media />}
                    {screen === "settings" && <ThemeSettings />}
                </Card>

                <SectionHeader title="Quick Controls" />
                <Card style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--spacing-md)" }}>
                    <Button variant="ghost">Reboot Pi</Button>
                    <Button variant="ghost">Shutdown</Button>
                    <Button variant="ghost">Restart Backend</Button>
                    <Button variant="ghost">Refresh Display</Button>
                </Card>
            </div>
        </ThemeProvider>
    );
}

createRoot(document.getElementById("root")).render(<App />);
