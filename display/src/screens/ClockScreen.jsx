import React, {useEffect, useState} from "react";


export default function ClockScreen(){

    const [time,setTime] = useState(new Date());


    useEffect(()=>{

        const timer=setInterval(()=>{

            setTime(new Date());

        },1000);


        return ()=>clearInterval(timer);

    },[]);


    return (

        <div style={{
            height:"100%",
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            alignItems:"center"
        }}>

            <div style={{
                fontSize:"70px"
            }}>
                {
                    time.toLocaleTimeString([],{
                        hour:"2-digit",
                        minute:"2-digit"
                    })
                }
            </div>


            <div style={{
                fontSize:"25px"
            }}>
                {
                    time.toLocaleDateString()
                }
            </div>

        </div>

    );

}
