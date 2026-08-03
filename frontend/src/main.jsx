import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import Dashboard from "./components/Dashboard";
import Clock from "./components/Clock";
import Media from "./components/Media";
import SystemStats from "./components/SystemStats";
import DockerStats from "./components/DockerStats";

const API_URL = "http://192.168.1.50:8001";


function App(){

    const [screen,setScreen] = useState("dashboard");


    async function changeScreen(newScreen){

        setScreen(newScreen);

        try {

            await fetch(`${API_URL}/screen`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    screen:newScreen
                })
            });

        } catch(error){

            console.error(
                "Backend connection failed:",
                error
            );

        }

    }


    return (

        <div
        style={{
            background:"#111",
            color:"white",
            minHeight:"100vh",
            padding:"20px",
            fontFamily:"Arial"
        }}
        >


            <h1>
                Pi Display Manager
            </h1>


            <h3>
                Current Screen: {screen.toUpperCase()}
            </h3>



            <div>

                <button
                style={{
                    margin:"5px",
                    padding:"15px",
                    fontSize:"16px"
                }}
                onClick={()=>changeScreen("dashboard")}
                >
                    🖥 Dashboard
                </button>



                <button
                style={{
                    margin:"5px",
                    padding:"15px",
                    fontSize:"16px"
                }}
                onClick={()=>changeScreen("clock")}
                >
                    🕒 Clock
                </button>



                <button
                style={{
                    margin:"5px",
                    padding:"15px",
                    fontSize:"16px"
                }}
                onClick={()=>changeScreen("media")}
                >
                    🎬 Media
                </button>

            </div>



            <hr/>



            <SystemStats/>
	    <DockerStats/>


            <hr/>



            <h2>
                Display Preview
            </h2>



            {
                screen==="dashboard" &&
                <Dashboard/>
            }



            {
                screen==="clock" &&
                <Clock/>
            }



            {
                screen==="media" &&
                <Media/>
            }



            <hr/>



            <h2>
                Settings
            </h2>


            <div
            style={{
                background:"#222",
                padding:"20px",
                borderRadius:"10px"
            }}
            >

                <p>
                    Display Orientation: Portrait (coming soon)
                </p>

                <p>
                    Brightness Control: Coming Soon
                </p>

                <p>
                    Fan Control: Hardware Pending
                </p>

                <p>
                    RGB Control: Hardware Pending
                </p>

            </div>


        </div>

    );

}



createRoot(
    document.getElementById("root")
).render(<App />);
