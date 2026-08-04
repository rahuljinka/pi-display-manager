import { useEffect, useState } from "react";

const API = `http://${window.location.hostname}:8001`;


export default function Media(){

    const [files,setFiles] = useState([]);


    async function loadMedia(){

        try{

            const response = await fetch(
                `${API}/media`
            );

            const data = await response.json();

            setFiles(data.files);

        }
        catch(error){

            console.log(
                "Media load error:",
                error
            );

        }

    }



    useEffect(()=>{

        loadMedia();

    },[]);




    return (

        <div>

            <h2>
                🎬 Available Media
            </h2>


            {
                files.length === 0 &&

                <p>
                    No media available
                </p>

            }



            {
                files.map(file=>(

                    <div

                    key={file.filename}

                    style={{
                        marginBottom:"20px"
                    }}

                    >


                        <b>
                            {file.filename}
                        </b>


                        {
                            file.type === "GIF" &&

                            <div>

                                <img

                                src={`${API}/media/${file.filename}`}

                                style={{

                                    width:"300px",

                                    height:"200px",

                                    objectFit:"contain",

                                    background:"#000"

                                }}

                                />

                            </div>

                        }



                        {
                            file.type === "MP4" &&

                            <video

                            src={`${API}/media/${file.filename}`}

                            controls

                            style={{

                                width:"300px"

                            }}

                            />

                        }



                    </div>

                ))

            }


        </div>

    );

}
