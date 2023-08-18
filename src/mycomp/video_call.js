import Button from "@material-ui/core/Button"
import { Icon, IconButton } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from 'simple-peer';
import { connect, io } from "socket.io-client";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


const socket = io("http://localhost:6003",{ transports: [ "websocket" ]});

function Video({username}) {
  const [ me, setMe ] = useState("");
  const [ stream, setStream] = useState();
  const [ receivingCall, setReceivingCall] = useState(false);
  const [ caller, setCaller ] = useState("");
  const [ callerSignal, setCallerSignal ] = useState();
  const [ callAccepted, setCallAccepted ] = useState(false);
  const [ idToCall, setIdToCall ] = useState("");
  const [ callEnded, setCallEnded ] = useState(false);
  const [ name, setName ] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream;
    });

    socket.on("me", (id) => {
      setMe(id);
      console.log("connected")
    });

    socket.on("callUser", (data) => {
        setName(data.name);
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    })

  }, [] )

  useEffect(() => {
    if (connectionRef.current != null){
      connectionRef.current.on("close", () => {
        setCallEnded(true);
        connectionRef.current.destroy();
      })
    }
  })

  const callUser = (id) => {
    const peer = new Peer({
      initiator : true,
      trickle : false,
      stream : stream,
    })

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: username
      })
    })

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;

    })

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
       
    })

    connectionRef.current = peer;

  }

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator : false,
      trickle : false,
      stream : stream
    });
    
    peer.on("signal", (data) => {
      socket.emit("answerCall", {signal: data, to: caller});
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    })

    peer.signal(callerSignal);
    connectionRef.current = peer;

  }

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    
  }

  return (
    <div className="Video-Call" style={{marginTop:"50px"}}>
      
      {/* <h1 style={{ textAlign: "center", color: "blue"}}> Video Call </h1> */}
      <button >Video Call</button>
      <div className="container">
          
        <div className="video-container">
            
          
            {stream && <video playsInline muted ref={myVideo} autoPlay style={{width: "300px",marginLeft:"0px"}} />}
          
          
            {callAccepted && !callEnded ? 
              <video playsInline ref={userVideo} autoPlay style={{width : "300px",marginLeft:"200px"}} /> : null
            }
          
        </div>
        
        <div className="myId">
          <TextField 
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
            style={{color:"crimson",borderColor:"crimson"}}
          />

            <CopyToClipboard text={me} style={{marginTop: "2vh", marginLeft:"20px"}}>
            <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
            Copy ID
            </Button>
          </CopyToClipboard>
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call 
              </Button>
            ): 
              (<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}> 
                <PhoneIcon fontSize="large" />
                Call
              </IconButton>)
            }
           
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1> {name} is calling... </h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null }
        </div>
      </div>
    </div>
  );
}

export default Video;
