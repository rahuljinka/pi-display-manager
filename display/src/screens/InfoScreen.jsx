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

    const formatDay = (dateStr) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString(undefined, { weekday: 'short' });
    };

    return (
        <DisplayLayout>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                <SectionHeader title="System Info" />
                
                <Card style={{ textAlign: "center", padding: "var(--spacing-lg)" }}>
                    <h1 style={{ fontSize: "56px", margin: "0", lineHeight: "1" }}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h1>
                    <p style={{ color: "var(--color-textSecondary)", fontSize: "18px", marginTop: "var(--spacing-xs)" }}>
                        {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </Card>

                {weather && weather.current && (
                    <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "var(--spacing-md)" }}>
                        <div style={{ fontSize: "48px" }}>
                            {weatherIcon(weather.current.weathercode)}
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "42px", fontWeight: "bold", lineHeight: "1" }}>
                                {Math.round(weather.current.temperature)}°F
                            </div>
                            <div style={{ color: "var(--color-textSecondary)", fontSize: "14px" }}>
                                Current Temp
                            </div>
                        </div>
                    </Card>
                )}

                {weather && weather.forecast && (
                    <div>
                        <SectionHeader title="7-Day Forecast" />
                        <Card padding="sm">
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {weather.forecast.map((day, idx) => (
                                    <div 
                                        key={day.date} 
                                        style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "space-between",
                                            padding: "var(--spacing-sm) 0",
                                            borderBottom: idx === weather.forecast.length - 1 ? "none" : "1px solid var(--color-border)"
                                        }}
                                    >
                                        <span style={{ width: "45px", fontWeight: "600" }}>{formatDay(day.date)}</span>
                                        <span style={{ fontSize: "24px", width: "35px", textAlign: "center" }}>{weatherIcon(day.code)}</span>
                                        <div style={{ width: "60px", textAlign: "center" }}>
                                            <span style={{ fontSize: "12px", color: "var(--color-info)", display: "block" }}>
                                                {day.rain_chance}%
                                            </span>
                                            <span style={{ fontSize: "10px", color: "var(--color-textSecondary)", textTransform: "uppercase" }}>Rain</span>
                                        </div>
                                        <div style={{ width: "80px", textAlign: "right" }}>
                                            <span style={{ fontWeight: "600" }}>{Math.round(day.high)}°</span>
                                            <span style={{ color: "var(--color-textSecondary)", marginLeft: "var(--spacing-xs)", fontSize: "14px" }}>{Math.round(day.low)}°</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
                
                <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)", padding: "var(--spacing-sm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>Location</span>
                        <span>Somerset, NJ</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span style={{ color: "var(--color-textSecondary)" }}>Network</span>
                        <span>Connected (eth0)</span>
                    </div>
                </Card>
            </div>
        </DisplayLayout>
    );
}
