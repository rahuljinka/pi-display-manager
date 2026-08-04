import React, {useEffect, useState} from "react";


const API = `http://${window.location.hostname}:8001`;


export default function DockerStatus(){

    const [containers,setContainers] = useState([]);


    async function loadContainers(){

        try{

            const response = await fetch(
                `${API}/containers`
            );

            const data = await response.json();

            setContainers(data);

        }
        catch(error){

            console.log(error);

        }

    }


    useEffect(()=>{

        loadContainers();

        const timer = setInterval(
            loadContainers,
            5000
        );

        return ()=>clearInterval(timer);

    },[]);



    return (

        <div style={{
            width:"90%"
        }}>

            <h2>
                Docker
            </h2>


            {
                containers.map((container)=>(

                    <div
                        key={container.name}
                        style={{
                            display:"flex",
                            justifyContent:"space-between",
                            margin:"8px 0",
                            fontSize:"20px"
                        }}
                    >

                        <span>
                            {container.name}
                        </span>


                        <span>
                            🟢
                        </span>

                    </div>

                ))
            }

        </div>

    );

}
