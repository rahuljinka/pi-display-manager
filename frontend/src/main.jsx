import React from "react";
import { createRoot } from "react-dom/client";

function App(){

    return (
        <div style={{
            height:"100vh",
            background:"#111",
            color:"white",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            fontSize:"40px"
        }}>
            Pi Display Manager
        </div>
    );
}


createRoot(
    document.getElementById("root")
).render(<App />);
