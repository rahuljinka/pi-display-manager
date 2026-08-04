import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import DashboardScreen from "./screens/DashboardScreen";
import InfoScreen from "./screens/InfoScreen";
import MediaScreen from "./screens/MediaScreen";


const API = `http://${window.location.hostname}:8001`;


function App(){

    const [screen, setScreen] = useState("loading");


    async function loadScreen(){
        console.log("Fetching screen from:", `${API}/screen`);
        try{

            const response = await fetch(
                `${API}/screen`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Received screen:", data.screen);


            setScreen(data.screen);


        }
        catch(error){

            console.error(
                "Screen error:",
                error
            );


            setScreen("error");

        }

    }



    useEffect(()=>{

        loadScreen();


        const timer = setInterval(
            loadScreen,
            3000
        );


        return ()=>clearInterval(timer);


    },[]);




    function renderScreen(){


        switch(screen){


            case "dashboard":

                return <DashboardScreen />;



            case "info":

                return <InfoScreen />;



            case "media":

                return <MediaScreen />;



            case "loading":

                return (

                    <div style={{
                        color:"white",
                        fontSize:"40px"
                    }}>

                        Loading...

                    </div>

                );



            case "error":

                return (

                    <div style={{
                        color:"white",
                        fontSize:"40px"
                    }}>

                        Backend Error

                    </div>

                );



            default:

                return (

                    <div style={{
                        color:"white",
                        fontSize:"40px"
                    }}>

                        Unknown Screen: {screen}

                    </div>

                );

        }

    }




    return (

        <div

            style={{

                width:"100vw",

                height:"100vh",

                overflow:"hidden",

                background:"#111"

            }}

        >

            {renderScreen()}


        </div>

    );

}




createRoot(
    document.getElementById("root")
).render(
    <App />
);
