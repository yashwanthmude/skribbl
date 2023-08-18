import React, {useState, useEffect, useRef} from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
import Axios from "axios";
import Stats from './Stats'
import './Home.css';
import Button from 'react-bootstrap/Button';
import io from 'socket.io-client';

var lobbySocket = null;

const InitialPage = () => {
    const [joinRoom, setJoinRoom] = useState("Create Room");
    // const [publicrooms,setPublicrooms]=useState([]);
    const roomRef = useRef("");
    const [roomId, setRoomId] = useState("");
    const history = useHistory();
    const {username,databaseid} = useParams();
    const [showGlobalboard,setShowGlobalboard]=useState(false);
    const [alluser,setAlluser]=useState([]);
    const [allscores,setscores]=useState([]);

    useEffect(() => {
        lobbySocket = io("http://127.0.0.1:5000",{ transports: [ "websocket" ],query:{userName:username}});
        
        return () => {
            lobbySocket.disconnect();
        };
    },[]);

    useEffect(() => {
        console.log("hmmm");
        lobbySocket.on("AVAILABLE ROOM", (room) => {   
            console.log(room);
            roomRef.current = room;
            console.log(roomRef.current);
        })

    },[lobbySocket]);

    function askForRoom()  {
        lobbySocket.emit("GIVE AVAILABLE ROOM");
        console.log("EEEE");
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (joinRoom==="Create Room"){
            let randomroomID = uuidv4();
            Axios.post(`http://localhost:3002/api/updateroomid/${databaseid}`,{roomid:randomroomID});
            history.push(`/lobby/${randomroomID}/${username}`);
        }
        else{
            Axios.post(`http://localhost:3002/api/updateroomid/${databaseid}`,{roomid:roomId});
            history.push(`/lobby/${roomId}/${username}`);
        }
    };
    const handlePlay=(e)=>{
 
        askForRoom();
        setTimeout(() => {
        console.log(roomRef.current);
        Axios.post(`http://localhost:3002/api/updateroomid/${databaseid}`,{roomid:roomRef.current});
        history.push(`/lobby/${roomRef.current}/${username}`);
        },200);
        
    }
    const handleBoard=(e)=>{
        e.preventDefault();
        Axios.get(`http://localhost:3002/api/get`).then((data) => {
            console.log(data);
            // setAlldata(data.data);
            
            data.data.map((datum,index) => {
                setAlluser((prevState) => [...prevState,datum.UserName]);
                setscores((prevState) => [...prevState,datum.Highestscore]);
            })
            
        });
        setShowGlobalboard(true);
    }

    return (
        <div className="initial-page">
        <h2>Play Game</h2>
        <Button variant="primary" className="publicroom" onClick={handlePlay}> Play</Button>
        <form onSubmit={handleSubmit}>
            {joinRoom === "Create Room" && <Button variant="primary" onClick={handleSubmit}> Create Private Room </Button>}
           {joinRoom === "Join Room" && <div className="room-id"> <label> Room ID </label><input type="text" 
           required value={roomId} 
           onChange={(e) => {setRoomId(e.target.value)}}
           > 
           </input>
           <Button variant="primary" onClick={handleSubmit}> Join Room</Button>
           </div>
           }
           <br></br>
            <select style={{marginLeft:"10px"}} value={joinRoom} onChange={(e) => {setJoinRoom(e.target.value)}}>
                <option value="Create Room" > 
                    Create Room
                </option>
                <option value="Join Room"> Join Private Room</option>
            </select>
        </form>
        <div className ="user-info">
            <h3>Your Stats</h3>
            <Stats/>
        </div>
        <div>
            {!showGlobalboard && <Button variant="primary" onClick={handleBoard}> Show Global Leaderboard</Button>}
            {showGlobalboard && 
            <div>
                <ul>
                    {/* {/* {console.log(alldata)} */}
                    {/* {alluser.sort(function(a, b){return allscores[alluser.indexOf(a)] - allscores[alluser.indexOf(b)]})} */}
                    {/* {allscores=allscores.reverse()} */}
                    {alluser.length>0 && alluser.map((datum,index) => {
                        return(
                        <li>{alluser[index]}:{allscores[index]}</li>
                        )
                    }
                    )}
                </ul>
            </div>
            }
        </div>
        </div>
    );
}
 
export default InitialPage;