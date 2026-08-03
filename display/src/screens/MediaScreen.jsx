import React, { useEffect, useState } from "react";

const API = "http://192.168.1.50:8001";


export default function MediaScreen(){

    const [media,setMedia] = useState(null);


    async function loadMedia(){

        try{

            const response = await fetch(
                `${API}/media/current`
            );

            const data = await response.json();

            setMedia(data.file);

        }
        catch(error){

            console.log(
                "Media error:",
                error
            );

        }

    }


    useEffect(()=>{

        loadMedia();


        const timer = setInterval(
            loadMedia,
            1000
        );


        return ()=>clearInterval(timer);


    },[]);



    if(!media){

        return (

            <div style={{
                color:"white",
                fontSize:"40px"
            }}>
                No Media Selected
            </div>

        );

    }



    const url =
        `${API}/media/${media}`;



    if(
        media.endsWith(".mp4") ||
        media.endsWith(".webm")
    ){

        return (

            <video

                src={url}

                autoPlay
                muted
                loop
                playsInline

                style={{
                    width:"100vw",
                    height:"100vh",
                    objectFit:"contain",
                    background:"black"
                }}

            />

        );

    }



    return (

        <img

            src={url}

            style={{
                width:"100vw",
                height:"100vh",
                objectFit:"contain",
                background:"black"
            }}

        />

    );

}
