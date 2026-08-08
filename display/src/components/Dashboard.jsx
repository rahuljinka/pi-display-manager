import React, { useEffect, useState } from "react";
import DockerStatus from "./DockerStatus";
import { Card, ProgressBar, SectionHeader } from "./ui";

const API = `http://${window.location.hostname}:8001`;

export default function Dashboard() {
    const [stats, setStats] = useState(null);

    async function loadStats() {
        try {
            const response = await fetch(`${API}/stats`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setStats(data);
        }
        catch (error) {
            console.error("Failed to load stats:", error);
        }
    }

    useEffect(() => {
        loadStats();
        const timer = setInterval(loadStats, 3000);
        return () => clearInterval(timer);
    }, []);

    if (!stats) {
        return (
            <div style={{ color: "var(--color-textSecondary)", fontSize: "18px" }}>
                Loading stats...
            </div>
        );
    }

    const getTempColor = (temp) => {
        if (temp > 70) return "var(--color-error)";
        if (temp > 50) return "var(--color-warning)";
        return "var(--color-success)";
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <SectionHeader 
                title={stats.hostname || "Raspberry Pi"} 
                action={<span style={{ color: "var(--color-textSecondary)", fontSize: "12px" }}>UP: {stats.uptime}</span>}
            />

            <Card>
                <div style={{ marginBottom: "var(--spacing-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "600" }}>CPU</span>
                        <span>{stats.cpu ?? 0}%</span>
                    </div>
                    <ProgressBar value={stats.cpu ?? 0} />
                </div>

                <div style={{ marginBottom: "var(--spacing-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "600" }}>RAM</span>
                        <span>{stats.ram_percent ?? 0}%</span>
                    </div>
                    <ProgressBar value={stats.ram_percent ?? 0} color="var(--color-secondary)" />
                </div>

                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "600" }}>Storage</span>
                        <span>{stats.storage?.percent || 0}%</span>
                    </div>
                    <ProgressBar value={stats.storage?.percent || 0} color="var(--color-info)" />
                </div>
            </Card>

            <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "600" }}>Temperature</span>
                <span style={{ 
                    fontSize: "24px", 
                    fontWeight: "bold", 
                    color: getTempColor(stats.temperature) 
                }}>
                    {stats.temperature ?? "--"}°C
                </span>
            </Card>

            <DockerStatus />
        </div>
    );
}
