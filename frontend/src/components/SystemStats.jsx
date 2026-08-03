import React, { useEffect, useState } from "react";

const API_URL = "http://192.168.1.50:8001";

export default function SystemStats(){
    const [stats,setStats] = useState(null);

    async function loadStats(){
        try{
            const response = await fetch(`${API_URL}/stats`);
            const data = await response.json();
            setStats(data);
        }catch(error){
            console.error(
                "Stats failed:",
                error
            );
        }
    }

    useEffect(()=>{
        loadStats();
        const interval = setInterval(
            loadStats,
            5000
        );
        return ()=>clearInterval(interval);
    },[]);

    if(!stats){
        return <p>Loading stats...</p>;
    }
    return (
        <div style={{
            background:"#222",
            padding:"20px",
            borderRadius:"10px",
            marginTop:"20px"
        }}>
            <h2>
                System Stats
            </h2>

            <p>
                Hostname: {stats.hostname}
            </p>

            <p>
                IP: {stats.ip}
            </p>

            <p>
                CPU: {stats.cpu}%
            </p>

            <p>
                RAM: {stats.ram_percent}%
            </p>

            <p>
                Temperature: {stats.temperature}°C
            </p>

            <p>
                Storage: {stats.storage.percent}%
            </p>

            <p>
                Uptime: {stats.uptime}
            </p>

            <p>
                OS: {stats.os.name} {stats.os.version}
            </p>
        </div>
    );
}
