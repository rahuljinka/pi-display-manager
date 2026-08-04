import React from "react";


export default function DisplayLayout({ children }) {

    return (

        <div

            style={{

                width:"100vw",

                height:"100vh",

                background:"#111",

                color:"white",

                overflow:"hidden",

                display:"flex",

                justifyContent:"center",

                alignItems:"center",

                fontFamily:"Arial, sans-serif",

                userSelect:"none",

                boxSizing:"border-box"

            }}

        >

            <div

                style={{

                    width:"100%",

                    height:"100%",

                    maxWidth:"1920px",

                    maxHeight:"1080px",

                    padding:"2vw",

                    boxSizing:"border-box"

                }}

            >

                {children}

            </div>


        </div>

    );

}
