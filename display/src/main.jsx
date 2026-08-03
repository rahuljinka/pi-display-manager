import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import DashboardScreen from "./screens/DashboardScreen";
import ClockScreen from "./screens/ClockScreen";
import MediaScreen from "./screens/MediaScreen";

const API = "http://192.168.1.50:8001";


function App(){

    const [screen,setScreen] = useState("loading");


    async function loadScreen(){

        try{

            const response = await fetch(
                `${API}/screen`
            );

            const data = await response.json();

            setScreen(data.screen);

        }
        catch(error){

            console.log(error);
            setScreen("error");

        }

    }


    useEffect(()=>{

        loadScreen();

        const timer=setInterval(
            loadScreen,
            3000
        );


        return ()=>clearInterval(timer);

    },[]);



    return (

        <div style={{
            background:"#111",
            color:"white",
            height:"100vh",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            fontSize:"50px"
        }}>

            {
                screen==="dashboard" &&
                <DashboardScreen />
            }


            {
                screen==="clock" &&
                <ClockScreen />
            }


            {
                screen==="media" &&
                <MediaScreen />
            }


            {
                screen==="loading" &&
                "Loading..."
            }


            {
                screen==="error" &&
                "Backend Error"
            }


        </div>

    );

}


createRoot(
    document.getElementById("root")
).render(<App />);
