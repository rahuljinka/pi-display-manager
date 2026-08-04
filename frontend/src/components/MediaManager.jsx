import { useEffect, useState } from "react";

const API = `http://${window.location.hostname}:8001`;


export default function MediaManager(){

    const [files,setFiles] = useState([]);
    const [selectedFile,setSelectedFile] = useState(null);
    const [current,setCurrent] = useState(null);
    const [dragging,setDragging] = useState(false);



    async function loadFiles(){

        const res = await fetch(
            `${API}/media`
        );

        const data = await res.json();

        setFiles(data.files);

    }



    async function loadCurrent(){

        const res = await fetch(
            `${API}/media/current`
        );

        const data = await res.json();

        setCurrent(data.file);

    }



    useEffect(()=>{

        loadFiles();
        loadCurrent();

    },[]);




    function handleFile(file){

        if(!file)
            return;


        setSelectedFile(file);

    }




    async function upload(){

        if(!selectedFile)
            return;


        const form = new FormData();

        form.append(
            "file",
            selectedFile
        );


        await fetch(
            `${API}/media/upload`,
            {
                method:"POST",
                body:form
            }
        );


        setSelectedFile(null);

        loadFiles();

    }





    async function show(filename){

        await fetch(
            `${API}/media/current`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    file:filename
                })
            }
        );


        await fetch(
            `${API}/screen`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    screen:"media"
                })
            }
        );


        setCurrent(filename);

    }





    async function remove(filename){

        await fetch(
            `${API}/media/${filename}`,
            {
                method:"DELETE"
            }
        );


        loadFiles();

    }





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
                🎬 Media Manager
            </h2>



            <p>
                Currently Playing:
                <b>
                    {" "}
                    {current || "None"}
                </b>
            </p>





            <div

            onDragOver={(e)=>{

                e.preventDefault();
                setDragging(true);

            }}


            onDragLeave={()=>{

                setDragging(false);

            }}



            onDrop={(e)=>{

                e.preventDefault();

                setDragging(false);

                handleFile(
                    e.dataTransfer.files[0]
                );

            }}



            onClick={()=>{

                document
                .getElementById("mediaUpload")
                .click();

            }}



            style={{

                border:"2px dashed",

                padding:"40px",

                textAlign:"center",

                cursor:"pointer",

                marginBottom:"20px",

                background:
                    dragging
                    ? "#333"
                    : "#111"

            }}

            >


                {
                    selectedFile

                    ?

                    <>
                        Selected:
                        <br/>

                        <b>
                            {selectedFile.name}
                        </b>
                    </>

                    :

                    <>
                        Drag media here
                        <br/>
                        or click to browse
                    </>

                }


            </div>





            <input

                id="mediaUpload"

                type="file"

                hidden

                accept=".gif,.mp4,.webm,.png,.jpg,.jpeg"

                onChange={(e)=>{

                    handleFile(
                        e.target.files[0]
                    );

                }}

            />





            <button

            onClick={upload}

            disabled={!selectedFile}

            >

                Upload

            </button>





            <hr/>





            {
                files.length===0 &&

                <p>
                    No media uploaded
                </p>

            }





            {
                files.map(file=>(


                    <div

                    key={file.filename}

                    style={{

                        border:"1px solid #444",

                        padding:"15px",

                        marginBottom:"15px",

                        borderRadius:"10px"

                    }}

                    >




                        {
                            file.type==="GIF" &&


                            <img

                            src={`${API}/media/${file.filename}`}

                            style={{

                                width:"200px",

                                height:"120px",

                                objectFit:"contain",

                                background:"#000"

                            }}

                            />

                        }




                        {
                            file.type==="MP4" &&


                            <div
                            style={{
                                fontSize:"60px"
                            }}
                            >
                                🎬
                            </div>

                        }





                        <p>
                            <b>
                                {file.filename}
                            </b>
                        </p>



                        <p>
                            Type: {file.type}
                        </p>



                        <p>
                            Size: {file.size} MB
                        </p>



                        <p>
                            Uploaded:
                            {" "}
                            {file.uploaded}
                        </p>




                        <button

                        onClick={()=>show(file.filename)}

                        >

                            ▶ Display

                        </button>





                        <button

                        onClick={()=>remove(file.filename)}

                        style={{

                            marginLeft:"10px"

                        }}

                        >

                            🗑 Delete

                        </button>



                    </div>


                ))

            }




        </div>

    );

}
