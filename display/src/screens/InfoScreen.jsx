import React, { useEffect, useState } from "react";
import DisplayLayout from "../components/DisplayLayout";
import { Card, SectionHeader } from "../components/ui";

const API = `http://${window.location.hostname}:8001`;

function weatherIcon(code) {
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 50) return "🌫️";
    if (code <= 60) return "🌧️";
    if (code <= 70) return "❄️";
    if (code <= 80) return "🌦️";
    return "⛈️";
}

export default function InfoScreen() {
    const [time, setTime] = useState(new Date());
    const [weather, setWeather] = useState(null);

    async function loadWeather() {
        try {
            const response = await fetch(`${API}/weather`);
            const data = await response.json();
            setWeather(data);
        } catch (error) {
            console.log("Weather error:", error);
        }
    }

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        loadWeather();
        const weatherTimer = setInterval(loadWeather, 600000);
        return () => {
            clearInterval(timer);
            clearInterval(weatherTimer);
        };
    }, []);

    return (
        <DisplayLayout>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
                <SectionHeader title="System Info" />
                
                <Card style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
                    <h1 style={{ fontSize: "64px", margin: "0" }}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h1>
                    <p style={{ color: "var(--color-textSecondary)", fontSize: "20px", marginTop: "var(--spacing-sm)" }}>
                        {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </Card>

                {weather && (
                    <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "var(--spacing-lg)" }}>
                        <div style={{ fontSize: "64px" }}>
                            {weatherIcon(weather.current.weather_code)}
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "48px", fontWeight: "bold" }}>
                                {Math.round(weather.current.temperature_2m)}°C
                            </div>
                            <div style={{ color: "var(--color-textSecondary)" }}>
                                Outside Temp
                            </div>
                        </div>
                    </Card>
                )}
                
                <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>Location</span>
                        <span>London, UK</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>Network</span>
                        <span>Connected (eth0)</span>
                    </div>
                </Card>
            </div>
        </DisplayLayout>
    );
}
