import React, { useEffect, useState } from "react";

import DisplayLayout from "../components/DisplayLayout";

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

        const timer = setInterval(() => {

            setTime(new Date());

        }, 1000);

        loadWeather();

        const weatherTimer = setInterval(() => {

            loadWeather();

        }, 600000);

        return () => {

            clearInterval(timer);

            clearInterval(weatherTimer);

        };

    }, []);

    return (

        <DisplayLayout>

            <div

                style={{

                    display: "flex",

                    flexDirection: "column",

                    alignItems: "center",

                    width: "100%",

		    maxWidth: "1400px",

                    height: "100%",

		    margin: "0 auto"

                }}

            >

                <h1

                    style={{

                        fontSize: "9vw",

                        margin: "1vh 0"

                    }}

                >

                    {time.toLocaleTimeString([], {

                        hour: "2-digit",

                        minute: "2-digit"

                    })}

                </h1>

                <h2

                    style={{

                        fontSize: "3vw",

                        margin: 0

                    }}

                >

                    {time.toLocaleDateString([], {

                        weekday: "long",

                        month: "long",

                        day: "numeric"

                    })}

                </h2>

                {weather && (

                    <>

                        <h2

                            style={{

                                fontSize: "2.5vw",

                                marginTop: "2vh"

                            }}

                        >

                            📍 {weather.location}

                        </h2>

                        <div

                            style={{

                                display: "flex",

                                justifyContent: "center",

                                flexWrap: "wrap",

                                gap: "1vw",

                                marginTop: "2vh",

                                width: "100%",

				maxWidth: "1200px"

                            }}

                        >

                            {weather.forecast.map(day => (

                                <div

                                    key={day.date}

                                    style={{

                                        background: "#222",

                                        borderRadius: "15px",

                                        padding: "1vw",

                                        width: "11vw",

                                        minWidth: "90px",

                                        textAlign: "center"

                                    }}

                                >

                                    <div

                                        style={{

                                            fontSize: "1.4vw"

                                        }}

                                    >

                                        {new Date(day.date).toLocaleDateString([], {

                                            weekday: "short"

                                        })}

                                    </div>

                                    <div

                                        style={{

                                            fontSize: "3vw",

                                            margin: "0.5vh 0"

                                        }}

                                    >

                                        {weatherIcon(day.code)}

                                    </div>

                                    <div

                                        style={{

                                            fontSize: "1.5vw"

                                        }}

                                    >

                                        <b>{Math.round(day.high)}°</b>

                                        <br />

                                        {Math.round(day.low)}°

                                    </div>

                                </div>

                            ))}

                        </div>

                    </>

                )}

            </div>

        </DisplayLayout>

    );

}
