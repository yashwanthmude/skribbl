import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Board from '../mycomp/board';
import Chat from    '../mycomp/chat';
// import Participants from '../mycomp/participants';
import pen from '../img/pen.gif';
import eraser from '../img/rubber.gif';
import ClearIcon from '@mui/icons-material/Clear';
import io from 'socket.io-client';
import { useParams } from 'react-router';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { render } from 'sass';
import './lobby.css';
import AssignmentIcon from "@material-ui/icons/Assignment";
import { ListGroup, Card, Navbar, Nav } from 'react-bootstrap';
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from 'simple-peer';
import Video from '../mycomp/video_call';

var gameSocket = null;

const Lobby = () => {
    
    const {roomid,username} = useParams();
    const [ color, setColor ] = useState("#000000");
    const [ size, setSize ] = useState("2");
    const [ mode, setMode ] = useState("pen");
    const [ time, setTime ] = useState("");
    const [ timeUp, setTimeUp ] = useState(false);
    const [ picker, setPicker ] = useState("");
    const [ roundNumber, setRoundNumber ] = useState(0);
    const [ boardLock, setBoardLock ] = useState(false);
    const [ wordList, setWordList ] = useState([]);
    const [ showWordList, setShowWordList ] = useState(false);
    const [ choseWord, setChoseWord ] = useState(false);
    const [ choosenWord, setChoosenWord ] = useState("");
    const [ chatLock, setChatlock ] = useState(false);
    const [ gameOver, setGameOver ] = useState(false);
    const [ drawing, setDrawing ] = useState(false);
    const [ correctWord, setCorrectWord ] = useState("");
    const [ users, setUsers ] = useState([]);
    const [ socketToUsername, setSocketToUsername ] = useState(new Map());
    const [ points, setPoints ] = useState(new Map());

    useEffect(() => {
        
        gameSocket = io("http://127.0.0.1:5050",{ transports: [ "websocket" ],query:{userName:username}});
        gameSocket.emit("JOIN_ROOM", roomid);
        gameSocket.on("Time broadcast", (time) => {
            setTime(time);
            console.log("time received",time);
        })

        gameSocket.on("New user", (users, transitString) => {
            console.log("Users");
            setUsers(users);
            let newMap = new Map(Array.from(transitString));
            console.log(newMap);
            setSocketToUsername(newMap);
        })

        gameSocket.on("Round number", (round) => {
            setRoundNumber(round);
        });

        return () => {
            gameSocket.disconnect();
          
        }
    },[])

    useEffect(() => {
        gameSocket.on("Global time broadcast", (time) => {
            console.log("entered");
            setTime(time);
        })

        gameSocket.on("Times up", () => {
            console.log("Time up");
            setTimeUp(true);
        });

        gameSocket.on("User picking word", (userName, round) => {
            setPicker(userName);
            setRoundNumber(round);
            setGameOver(false);
            
            if (userName !== username){
                setBoardLock(true);
                setShowWordList(false);
                setChatlock(false);
            }
        });

        gameSocket.on("Round number", (round) => {
            setRoundNumber(round);
        })

        gameSocket.on("Pick A Word", (wordList) => {
            setWordList(wordList);
            setShowWordList(true);
        });

        gameSocket.on("Game over", () => {
            setGameOver(true);
        });

        gameSocket.on("User is drawing", (user, word) => {
            console.log(word);
            setCorrectWord(word);
            setDrawing(true);
            setTimeUp(false);
        });

        gameSocket.on("User disconnected", (users, transitString) => {
            console.log("Disconnected users");
            console.log(socketToUsername);
            setUsers(users);
            let newMap = new Map(Array.from(transitString));
            console.log(newMap);
            setSocketToUsername(newMap);
        });

    },[gameSocket, users])

    const handleChoseWord = (word) => {
        gameSocket.emit("Chose word", word);
        setChatlock(true);
        setBoardLock(false);
    }

    return (
    <div className="lobby">
    <Container className="Skribbl"></Container>
                <CopyToClipboard text={roomid}>
                    <Button  style={{marginTop:"-15vh",marginLeft:"1000px"}} svariant="contained" color="primary" startIcon={<AssignmentIcon fontSize="medium" />}>
                    Copy Room ID
                    </Button>
                </CopyToClipboard>
                <Button  style={{marginTop:"-15vh",marginLeft:"20px"}} svariant="contained" color="primary" startIcon={<AssignmentIcon fontSize="medium" />}>
                    {!gameOver ? `Round: ${roundNumber}` : "Game Over"}
                </Button>
    <Container fluid="md" >
                
    <Row >
    <Col>
        <span>
            
            <Modal
            show={showWordList}
            // onHide={() => setShowWordList(false)}
            backdrop="static"
            keyboard={false}
            >
            <Modal.Header closeButton>
                <Modal.Title>Choose A Word</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <span style={{marginLeft:"70px"}}>
                {wordList.map((word, index) => {
                    return (
                        <Button className="wordButton" variant="secondary"
                            key={index}
                         onClick={() => {setShowWordList(false);setChoseWord(true);handleChoseWord(word);setChoosenWord(word)}}>
                             {word}
                        </Button>
                    );
                })}
                </span>
            </Modal.Body>
            {/* <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowWordList(false)}>
                Close
                </Button>
                <Button variant="primary">Understood</Button>
            </Modal.Footer> */}
            </Modal>
            <span>
                <div>
                    <span>
                    {!gameOver && time != 0 && drawing ? <h4 style={{color:"crimson"}}>Time remaining: {time}</h4> : timeUp && <h4 style={{color:"crimson"}}>Correct Word: {correctWord} </h4> }
                    </span>
                <div className="Participants">
                    <div>
                    {/* <h2>Participants</h2> */}
                    <Card style={{ width: '19.2rem'}}>
                    <Card.Header style={{color:"black"}} > Participants</Card.Header>
                    <ListGroup variant="flush">
                    {users.length>0 && users.map((user,index) => {
                    return(
                    <ListGroup.Item style={{color:"crimson"}} key={index}>{socketToUsername.get(user)} {points.get(socketToUsername.get(user))}</ListGroup.Item>
                    )})}
                    </ListGroup>
                    </Card>
                    </div>
                </div>
                </div>
            </span>
        </span>
    </Col>
    <Col  style={{marginTop:"-7vh"}} xs={6} >
        <span className="Board">
            <div>
                 <span className="color-picker-container" style={{color:"red"}}>
                     Select Brush Color : &nbsp; 
                     <input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>
                 </span>
                 <span className="brushsize-container" style={{color:"red", marginLeft:"5px"}}>
                     Select Brush Size : &nbsp; 
                     <select value={size} onChange={(e) => setSize(e.target.value)}>
                         <option> 2 </option>
                         <option> 5 </option>
                         <option> 10 </option>
                         <option> 15 </option>
                         <option> 20 </option>
                         <option> 25 </option>
                         <option> 30 </option>
                     </select>
                 </span>
                 <span className="Pen">
                 <button type="button" className="btn btn-black" onClick={()=>setMode("pen")}><img src={pen} alt="pen"></img></button>
                 </span>
                 <span className="Eraser">
                 <button type="button" className="btn btn-black" onClick={()=>setMode("eraser")}><img src={eraser} alt="eraser"></img></button>
                 </span>
                 </div>
                 <div className={mode==="eraser" ? "canvas2" : "canvas1"} id={boardLock===true ? "c1" : "c2"}>
                    <Board color={color} size={size} mode={mode} />
                 </div>
         </span>
    </Col>
    <Col style={{marginTop:"-3vh"}}>
        <span className="overflow-auto" id="chat-section">
                
                <h2>Chat</h2>
                <Chat 
                    Time={time}
                    word={correctWord}
                    gameSocket={gameSocket}
                    chatLock={chatLock}
                    changePoints={(points) => setPoints(points)}
                    setChatlock= {(val) => setChatlock(val)}
                />
                
        </span>
                
    </Col>
  </Row>
  <Video username={username}/>
  <div>

  </div>
</Container>
</div>

    )
}

export default Lobby;
