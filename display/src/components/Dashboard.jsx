import React, { useEffect, useState } from "react";


const API = "http://192.168.1.50:8001";


export default function Dashboard() {

    const [stats, setStats] = useState(null);


    async function loadStats() {

        try {

            const response = await fetch(
                `${API}/stats`
            );

            const data = await response.json();

            setStats(data);

        } catch (error) {

            console.log("Stats error:", error);

        }
    }


    useEffect(() => {

        loadStats();

        const timer = setInterval(
            loadStats,
            3000
        );


        return () => clearInterval(timer);

    }, []);


    if (!stats) {

        return (
            <div>
                Loading stats...
            </div>
        );

    }


    return (

        <div style={{
            width: "90%",
            textAlign: "center"
        }}>

            <h1>
                Raspberry Pi 5
            </h1>


            <div>
                CPU: {stats.cpu}%
            </div>


            <div>
                RAM: {stats.ram_percent}%
            </div>


            <div>
                Temperature: {stats.temperature}°C
            </div>


            <div>
                Storage: {stats.disk_percent}%
            </div>

        </div>

    );

}
