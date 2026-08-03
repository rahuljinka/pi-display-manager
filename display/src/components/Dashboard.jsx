import React, { useEffect, useState } from "react";
import DockerStatus from "./DockerStatus";

const API = "http://192.168.1.50:8001";


function Bar({value}) {

    return (
        <div style={{
            width:"100%",
            height:"20px",
            background:"#333",
            borderRadius:"10px",
            overflow:"hidden"
        }}>

            <div style={{
                width:`${value}%`,
                height:"100%",
                background:"#00ff88"
            }}/>

        </div>
    );
}



export default function Dashboard() {

    const [stats,setStats] = useState(null);


    async function loadStats(){

        try {

            const response = await fetch(
                `${API}/stats`
            );

            const data = await response.json();

            setStats(data);

        }
        catch(error){

            console.log(error);

        }

    }


    useEffect(()=>{

        loadStats();

        const timer=setInterval(
            loadStats,
            3000
        );


        return ()=>clearInterval(timer);

    },[]);



    if(!stats){

        return (
            <div>
                Loading...
            </div>
        );

    }



    return (

        <div style={{
            width:"90%",
            height:"100%",
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            gap:"25px"
        }}>


            <h1 style={{
                fontSize:"32px"
            }}>
                Raspberry Pi 5
            </h1>



            <div>

                <h3>
                    CPU {stats.cpu}%
                </h3>

                <Bar value={stats.cpu}/>

            </div>



            <div>

                <h3>
                    RAM {stats.ram_percent}%
                </h3>

                <Bar value={stats.ram_percent}/>

            </div>




            <div>

                <h3>
                    Storage {stats.disk_percent}%
                </h3>

                <Bar value={stats.disk_percent}/>

            </div>




            <div style={{
                fontSize:"28px"
            }}>

                🌡️ {stats.temperature}°C

            </div>

	<DockerStatus />
        </div>

    );

}
