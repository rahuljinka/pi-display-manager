import React, {useState} from "react";
import {createRoot} from "react-dom/client";

import Dashboard from "./components/Dashboard";
import Clock from "./components/Clock";
import Media from "./components/Media";


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

        <div style={{
            background:"#111",
            color:"white",
            height:"100vh",
            padding:"20px"
        }}>


            <h1>
                Pi Display Manager
            </h1>


            <button onClick={()=>changeScreen("dashboard")}>
                Dashboard
            </button>


            <button onClick={()=>changeScreen("clock")}>
                Clock
            </button>


            <button onClick={()=>changeScreen("media")}>
                Media
            </button>


            <hr/>


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


        </div>

    );

}


createRoot(
    document.getElementById("root")
).render(<App />);
