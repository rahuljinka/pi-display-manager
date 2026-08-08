import React, { useEffect, useState } from "react";
import { Card, StatusBadge, SectionHeader } from "./ui";

const API_URL = `http://${window.location.hostname}:8001`;

export default function DockerStats() {
    const [containers, setContainers] = useState([]);

    async function loadContainers() {
        try {
            const response = await fetch(`${API_URL}/containers`);
            const data = await response.json();
            setContainers(data);
        } catch (error) {
            console.error("Docker stats failed:", error);
        }
    }

    useEffect(() => {
        loadContainers();
        const interval = setInterval(loadContainers, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <SectionHeader title="Docker Containers" />
            <Card padding="sm">
                {containers.length === 0 ? (
                    <p style={{ padding: "var(--spacing-md)", textAlign: "center", color: "var(--color-textSecondary)" }}>
                        No containers found
                    </p>
                ) : (
                    containers.map((container, idx) => (
                        <div
                            key={container.name}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "var(--spacing-md)",
                                borderBottom: idx === containers.length - 1 ? "none" : "1px solid var(--color-border)"
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: "600" }}>{container.name}</span>
                                <span style={{ fontSize: "12px", color: "var(--color-textSecondary)" }}>{container.image || "Unknown Image"}</span>
                            </div>
                            <StatusBadge status={container.status.toLowerCase() === "running" || container.status.toLowerCase().includes("up") ? "healthy" : "error"}>
                                {container.status}
                            </StatusBadge>
                        </div>
                    ))
                )}
            </Card>
        </div>
    );
}
