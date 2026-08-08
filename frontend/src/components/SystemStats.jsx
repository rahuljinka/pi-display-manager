import React, { useEffect, useState } from "react";
import { Card, ProgressBar, SectionHeader } from "./ui";

const API_URL = `http://${window.location.hostname}:8001`;

export default function SystemStats() {
    const [stats, setStats] = useState(null);

    async function loadStats() {
        try {
            const response = await fetch(`${API_URL}/stats`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Stats failed:", error);
        }
    }

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!stats) {
        return <p style={{ color: "var(--color-textSecondary)" }}>Loading stats...</p>;
    }

    return (
        <div>
            <SectionHeader title="System Information" />
            <Card>
                <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>Hostname</span>
                        <span style={{ fontWeight: "600" }}>{stats.hostname}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>IP Address</span>
                        <span style={{ fontWeight: "600" }}>{stats.ip}</span>
                    </div>
                    
                    <hr style={{ border: "0", borderTop: "1px solid var(--color-border)", margin: "var(--spacing-xs) 0" }} />
                    
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ color: "var(--color-textSecondary)" }}>CPU Usage</span>
                            <span style={{ fontWeight: "600" }}>{stats.cpu}%</span>
                        </div>
                        <ProgressBar value={stats.cpu} />
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ color: "var(--color-textSecondary)" }}>RAM Usage</span>
                            <span style={{ fontWeight: "600" }}>{stats.ram_percent}%</span>
                        </div>
                        <ProgressBar value={stats.ram_percent} color="var(--color-secondary)" />
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ color: "var(--color-textSecondary)" }}>Storage</span>
                            <span style={{ fontWeight: "600" }}>{stats.storage.percent}%</span>
                        </div>
                        <ProgressBar value={stats.storage.percent} color="var(--color-info)" />
                    </div>

                    <hr style={{ border: "0", borderTop: "1px solid var(--color-border)", margin: "var(--spacing-xs) 0" }} />

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>Temperature</span>
                        <span style={{ fontWeight: "600", color: stats.temperature > 60 ? "var(--color-error)" : "var(--color-success)" }}>
                            {stats.temperature}°C
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>Uptime</span>
                        <span style={{ fontWeight: "600" }}>{stats.uptime}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
