import React, { useEffect, useState } from "react";
import { Card, StatusBadge, SectionHeader } from "./ui";

const API = `http://${window.location.hostname}:8001`;

export default function DockerStatus() {
    const [containers, setContainers] = useState([]);

    async function loadContainers() {
        try {
            const response = await fetch(`${API}/containers`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setContainers(data);
        }
        catch (error) {
            console.error("Failed to load containers:", error);
        }
    }

    useEffect(() => {
        loadContainers();
        const timer = setInterval(loadContainers, 5000);
        return () => clearInterval(timer);
    }, []);

    if (containers.length === 0) return null;

    return (
        <div>
            <SectionHeader title="Docker Containers" />
            <Card padding="sm">
                {containers.map((container, idx) => (
                    <div
                        key={container.name}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "var(--spacing-sm) 0",
                            borderBottom: idx === containers.length - 1 ? "none" : "1px solid var(--color-border)"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "500", fontSize: "16px" }}>
                                {container.name}
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--color-textSecondary)" }}>
                                {container.image || "Unknown Image"}
                            </span>
                        </div>
                        <StatusBadge status={container.status.toLowerCase() === "running" || container.status.toLowerCase().includes("up") ? "healthy" : "error"}>
                            {container.status}
                        </StatusBadge>
                    </div>
                ))}
            </Card>
        </div>
    );
}
