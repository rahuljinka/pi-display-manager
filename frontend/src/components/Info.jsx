import React, { useState, useEffect } from "react";
import { Card, SectionHeader } from "./ui";

export default function Info() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ width: "100%", textAlign: "center" }}>
            <SectionHeader title="System Clock" />
            <Card>
                <h1 style={{ fontSize: "48px", margin: "var(--spacing-md) 0" }}>
                    {time.toLocaleTimeString()}
                </h1>
                <p style={{ color: "var(--color-textSecondary)", fontSize: "18px" }}>
                    {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </Card>
        </div>
    );
}
