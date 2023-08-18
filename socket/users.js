var app=require('express')()
var http=require('http').createServer(app);
var io=require('socket.io')(http,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
});

var server_port=5000;
http.listen(server_port,()=>{
    console.log("Started on:"+server_port);
})


const { v4: uuidv4 } = require("uuid");

const rooms = [{id:uuidv4(),participants:0},{id:uuidv4(),participants:0},{id:uuidv4(),participants:0},{id:uuidv4(),participants:0}]

io.on("connection", (socket) => {

    console.log("User connected");
    
    socket.on("GIVE AVAILABLE ROOM", () => {
        // console.log("Hello");
        let flag = false;
        let room;
        for (var i=0;i<rooms.length;i++){
            if (rooms[i].participants < 4){
                flag = true;
                room = rooms[i].id;
                rooms[i].participants += 1;
                break;
            }
        }
        
        if (!flag){
           
            room = uuidv4();
            rooms.push({id:room,participants:1});
        }
        // console.log("ehoihasgi");
        console.log(room);
        io.to(socket.id).emit("AVAILABLE ROOM", room);
    });

    socket.on("disconnect",() =>{
        console.log("User disconnected");
    })
});