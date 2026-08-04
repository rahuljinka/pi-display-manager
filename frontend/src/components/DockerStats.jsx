import React, { useEffect, useState } from "react";

const API_URL = `http://${window.location.hostname}:8001`;


export default function DockerStats(){

    const [containers,setContainers] = useState([]);


    async function loadContainers(){

        try{

            const response = await fetch(
                `${API_URL}/containers`
            );

            const data = await response.json();

            setContainers(data);


        }catch(error){

            console.error(
                "Docker stats failed:",
                error
            );

        }

    }


    useEffect(()=>{

        loadContainers();

        const interval = setInterval(
            loadContainers,
            10000
        );


        return ()=>clearInterval(interval);


    },[]);



    return (

        <div
        style={{
            background:"#222",
            padding:"20px",
            borderRadius:"10px",
            marginTop:"20px"
        }}
        >

            <h2>
                Docker Containers
            </h2>


            {
                containers.map((container)=>(
                    
                    <div
                    key={container.name}
                    style={{
                        display:"flex",
                        justifyContent:"space-between",
                        padding:"10px",
                        borderBottom:"1px solid #444"
                    }}
                    >

                        <span>
                            {container.name}
                        </span>


                        <span>
                            {container.status}
                        </span>

                    </div>

                ))
            }


        </div>

    );

}
