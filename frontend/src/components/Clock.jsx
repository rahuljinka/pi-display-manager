export default function Clock(){

    return (
        <div>
            <h1>Clock</h1>
            <h2>
                {new Date().toLocaleTimeString()}
            </h2>
        </div>
    );
}
