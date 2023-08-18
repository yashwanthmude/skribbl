import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Axios from 'axios';

var socket = io("http://127.0.0.1:8080",{ transports: [ "websocket" ]});

const Chat = ({Time,word,gameSocket,chatLock,changePoints, setChatlock}) => {
    
    const {roomid,username} = useParams();
    const [messages, setMessages] = useState([]);
    const messagesEnd = useRef(null);
    const [value , setValue] = useState("");
    // const [lock, setLock]=useState(chatLock);
    
    useEffect(() => {
        
        console.log("HEYEYEYE");
        socket.emit("JOIN_ROOM",roomid,username);

        socket.on("Updated points", (transitString) => {
            let newMap = new Map(Array.from(transitString));
            changePoints(newMap);
        });

        return () => {
            socket.disconnect(roomid);
        };
    },[]);

    const handleSubmit = () => {
        if(value===word && word!==""){
            socket.emit("New Message",{userName: username,value: value, correct: true},roomid, Time);
            setValue("");
            setChatlock(true);
        }
        else if(value!=="" && word!==""){socket.emit("New Message",{userName: username,value, correct: false},roomid, Time)}
        else{
            socket.emit("New Message", {userName: username, value: value, correct: ""}, roomid, Time);
        }
        setValue("");
    }

    useEffect(() => {
        socket.on("New Message", (message) => {
            console.log(roomid);
            setMessages((prevState) => [...prevState, message]);
            // if(message.value===word){message.value="Correct guess";}
            // setMessages((prevState) => [...prevState, message]);
        });

        socket.on("Updated points", (transitString,newPoint) => {
            console.log(newPoint);
            Axios.get(`http://localhost:3002/api/gethighestscore/${username}`).then((data) => {
                console.log(data);
                            if(data.data[0].Highestscore < newPoint){
                                Axios.post(`http://localhost:3002/api/updatepoints/${username}/${newPoint}`);
                            }
                });
            let newMap = new Map(Array.from(transitString));
            changePoints(newMap);
        });

    },[socket]);

    useEffect(() => {
        messagesEnd.current.scrollIntoView({behavior : 'smooth'});
    },[messages]);

    return (
        <div className="overflow-auto" id="chat-section">      
            <Container fluid className="p-0">
                <Container className="d-flex flex-column chat-container">
                {/* {messages.length && messages.map((message,index) => <p key={index}>{message.userName}</p>)} */}
                <div className="scroll-content pl-2 pr-2">
                    <div className="container-fluid">
                    {messages.length>0 && messages.map((message,index) => {
                            return (  
                                <div className="speech-wrapper" key={index}>
                                    <div className={`bubble ${message.userName === username ? "" : 'alt'}`}>
                                        <div className="txt">
                                        <p className={`name ${message.userName === username ? "" : 'alt'}`}>{message.userName}</p>
                                        <p className="message">{message.value}</p>
                                        </div>
                                        <div className={`bubble-arrow ${message.userName === username ? "" : 'alt'}`}></div>
                                    </div>
                                {/* 
                                    <div className="bubble alt">
                                        <div className="txt">
                                        <p className="name alt">+353 87 1234 567<span> ~ John</span></p>
                                        <p className="message">Nice... this will work great for my new project.</p>
                                        <span className="timestamp">10:22 pm</span>
                                        </div>
                                        <div className="bubble-arrow alt"></div>
                                    </div> */}
                                    </div>
                                );
                        })}
                </div>

                 <div style={{ float: 'left', clear: 'both' }} ref={messagesEnd} />
                <span>
                    <input required
                    disabled={chatLock}
                    value= {value}
                    onChange={(e)=>{setValue(e.target.value)}}
                    style={{marginLeft:"0px"}}
                    placeholder={"Enter your guess here..."}
                    >
                    </input>
                <Button variant="primary"
                   
                    disabled={chatLock}
                    onClick={() => { handleSubmit();}}
                    >
                    Send
                    </Button>
                </span>
                 </div>
                  
                </Container>
            </Container>
        </div>
  
    );
}
 
export default Chat;