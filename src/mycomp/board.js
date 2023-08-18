import React from "react";
import io  from "socket.io-client";
import './board.css';
import {useState} from 'react';

import { withRouter } from "react-router";

class board extends React.Component {
    timeout;
    socket;
    ctx;
    username;
    roomid;
    mode;
    

    constructor(props){
        super(props);
        this.mode="pen";
        this.username =this.props.match.params.username;
        this.roomid =this.props.match.params.roomid;
        this.socket = io("http://127.0.0.1:8080",{ transports: [ "websocket" ],query:{userName:this.username}});
        console.log("Connecting");
        this.socket.emit("JOIN ROOM",this.roomid);
        
        this.socket.on("canvas-data",(data)=>{
            var image = new Image();
            var canvas = document.querySelector('#board');
            var ctx=canvas.getContext('2d');
            
            image.onload=function(){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image,0,0);
            };
            image.src=data;
        })

    }
    componentWillReceiveProps(newProps) {
        this.ctx.strokeStyle = newProps.color;
        this.ctx.lineWidth = newProps.size;
        this.mode = newProps.mode;
        if(this.mode==="delete"){
            var canvas = document.querySelector('#board');
            var ctx=canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.mode = "pen";
        }
        
    }
    componentDidMount(){
        this.socket.emit("JOIN_ROOM",this.roomid);
        this.paint();
    }

    componentWillUnmount(){
        this.socket.disconnect(this.roomid);
    }
    
    paint(){
        
        var canvas = document.querySelector('#board');
        var ctx = canvas.getContext('2d');
        this.ctx=ctx;
        var sketch_style = getComputedStyle(canvas);
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));
    
        var mouse = {x: 0, y: 0};
        var last_mouse = {x: 0, y: 0};
            /* Mouse Capturing Work */
            canvas.addEventListener('mousemove', function(e) {
                last_mouse.x = mouse.x;
                last_mouse.y = mouse.y;
        
                mouse.x = e.pageX - this.offsetLeft;
                mouse.y = e.pageY - this.offsetTop;
            }, false);
    
        /* Drawing on Paint App */
        ctx.lineWidth = this.props.size;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.props.color;
        ctx.globalCompositeOperation="source-over";
        window.addEventListener('resize', function(){
            var temp_base64ImageData=canvas.toDataURL("image/png");
            canvas.width = parseInt(sketch_style.getPropertyValue('width'));
            canvas.height = parseInt(sketch_style.getPropertyValue('height'));
            var image = new Image();
            image.onload=function(){
                ctx.drawImage(image,0,0,canvas.width,canvas.height);
            };
            image.src=temp_base64ImageData;
            ctx.lineWidth = root.props.size;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = root.props.color;
            ctx.globalCompositeOperation="source-over";
        });
        canvas.addEventListener('mousedown', function(e) {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);
    
        canvas.addEventListener('mouseup', function() {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);

        var root=this;
        var onPaint = function() {
            
                if(root.mode==="pen"){

                    ctx.globalCompositeOperation="source-over";
                    ctx.beginPath();
                    ctx.moveTo(last_mouse.x, last_mouse.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.closePath();
                    ctx.stroke();
                }
                if(root.mode==="eraser"){
                    ctx.globalCompositeOperation="destination-out";
                    // ctx.arc(last_mouse.x, last_mouse.y,1,0,Math.PI*2,false);
                    ctx.beginPath();
                    ctx.moveTo(last_mouse.x, last_mouse.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.closePath();
                    ctx.stroke();
                    // ctx.fill();
                    ctx.globalCompositeOperation="source-over";
                }
                if(root.timeout !== undefined){clearTimeout(root.timeout);}
                root.timeout=setTimeout(function(){
                    var base64ImageData=canvas.toDataURL("image/png");
                    root.socket.emit("canvas-data",base64ImageData,root.roomid);
                },200)
            
        };
    
    };
    render(){
        return(
        <canvas className="board" id ="board"></canvas>
        )
    }
 }

export default withRouter(board);