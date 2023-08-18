var app=require('express')()
var http=require('http').createServer(app);
var io=require('socket.io')(http,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
});

var server_port= process.env.YOUR_PORT || process.env.PORT || 5050;
http.listen(server_port,()=>{
    console.log("Started on:"+server_port);
})

let users = {}
let socketToRoom = {}
let roundToRoom = {}
let timeToRoom = {}
let maxRounds = 4
let roundGoing = {}
let UserNameToSocket = {}
let socketToUserName = new Map();
let words = [
    "America",
    "Balloon",
    "Biscuit",
    "Blanket",
    "Chicken",
    "Chimney",
    "Country",
    "Cupcake",
    "Curtain",
    "Diamond",
    "Eyebrow",
    "Fireman",
    "Florida",
    "Germany",
    "Harpoon",
    "Husband",
    "Morning",
    "Octopus",
    "Popcorn",
    "Printer",
    "Sandbox",
    "Skyline",
    "Spinach",
    "Backpack",
    "Basement",
    "Building",
    "Campfire",
    "Complete",
    "Elephant",
    "Exercise",
    "Hospital",
    "Internet",
    "Jalapeno",
    "Mosquito",
    "Sandwich",
    "Scissors",
    "Seahorse",
    "Skeleton",
    "Snowball",
    "Sunshade",
    "Treasure",
    "Blueberry",
    "Breakfast",
    "Bubblegum",
    "Cellphone",
    "Dandelion",
    "Hairbrush",
    "Hamburger",
    "Horsewhip",
    "Jellyfish",
    "Landscape",
    "Nightmare",
    "Pensioner",
    "Rectangle",
    "Snowboard",
    "Spaceship",
    "Spongebob",
    "Swordfish",
    "Telephone",
    "Telescope",
]

//Decrease time every sec

var x = setInterval(function() {
    Object.keys(timeToRoom).map((keyName, keyNumber) => {
        if (roundGoing[keyName]){
            let now = timeToRoom[keyName]-1;
            if (now >= 0 ){
                timeToRoom[keyName] = now;
            }
            if (now == 0){
                roundToRoom[keyName] += 1;
            }
        }
    });
},1000);

let startRound = (room) => {
    timeToRoom[room] = 30;
};

let pickRandomUser = (room) => {
    let usersInRoom = users[room];
    console.log(users);
    try{
    return usersInRoom[Math.floor(Math.random() * usersInRoom.length)];
    }
    catch(err){
        console.log(err);
        return "";
    }
}

let pickRandomWords = () => {
    
    words.sort(() => 0.5 - Math.random());

    return [words[0],words[1],words[2]];
}


io.on("connection", (socket) => {

    socket.on("JOIN_ROOM", (room)=>{
        console.log("User connected");
        let userName = socket.handshake.query.userName;
        if (users[room]){
            let length = users[room].length;

            
            if (length === 4){
                socket.emit("room full");
                return;
            }
            users[room].push(socket.id);
        }
        else{
            users[room] = [socket.id];
        }
        
        if (UserNameToSocket[userName]){
            UserNameToSocket[userName].push(socket.id);
        }
        else{
            UserNameToSocket[userName] = [socket.id];
        }

        socketToUserName.set(socket.id, userName);
         
        //console.log(timeToRoom[room]);
        socket.emit("Time broadcast", timeToRoom[room]);
        
        socket.join(room);
        console.log("assigning room = ",room);
        socketToRoom[socket.id] = room;
        console.log("Joining = ",socketToRoom);
        console.log("User = ",userName);
        console.log(socketToUserName);
        
        io.to(room).emit("New user", users[room], Array.from(socketToUserName));

        
        if (roundToRoom[room] <= maxRounds){
            if (users[room].length == 1){
                roundToRoom[room] = 0;
            }
            socket.emit("Round number", roundToRoom[room]);
        }

        if (!timeToRoom[room] && timeToRoom[room]!=0 && users[room].length >=2){
            console.log("starting rounds",socketToRoom[socket.id]);
            let socketID = pickRandomUser(socketToRoom[socket.id]);
            let wordList = pickRandomWords();
            console.log(socket.id,socketID,socketToUserName.get(socket.id));
            roundToRoom[room] = 1;
            io.to(socketToRoom[socket.id]).emit("User picking word", socketToUserName.get(socketID), roundToRoom[room]);
            io.to(socketID).emit("Pick A Word", wordList);        
        }

        // else if (roundToRoom[room] > maxRounds && users[room].length >= 2){
        //     console.log("Start");
        //     let socketID = pickRandomUser(socketToRoom[socket.id]);
        //     let wordList = pickRandomWords();
        //     console.log(socket.id,socketID,socketToUserName.get(socket.id));
        //     roundToRoom[room] = 1;
        //     io.to(socketToRoom[socket.id]).emit("User picking word", socketToUserName.get(socketID), roundToRoom[room]);
        //     io.to(socketID).emit("Pick A Word", wordList);           
        // }

    });

   
    var timer = setInterval(function() {
        
            if (roundGoing[socketToRoom[socket.id]]){
                console.log(timeToRoom[socketToRoom[socket.id]]);
                io.to(socketToRoom[socket.id]).emit("Global time broadcast", timeToRoom[socketToRoom[socket.id]]);
            }

            if (timeToRoom[socketToRoom[socket.id]] === 0 && roundGoing[socketToRoom[socket.id]]){
                io.to(socketToRoom[socket.id]).emit("Times up");
                roundGoing[socketToRoom[socket.id]] = false;
                console.log(roundToRoom[socketToRoom[socket.id]]);

                if (roundToRoom[socketToRoom[socket.id]] > maxRounds){
                    io.to(socketToRoom[socket.id]).emit("Game over");
                    roundGoing[socketToRoom[socket.id]] = false;
                    console.log("max rounds reached");
                    return;
                }
                else if (users[socketToRoom[socket.id]].length >=2) {
                    
                    setTimeout(() => {
                        console.log("socketToRoom",socketToRoom);
                        let socketID = pickRandomUser(socketToRoom[socket.id]);
                        let wordList = pickRandomWords();
                        console.log(socket.id,socketID,socketToUserName.get(socket.id));
                        io.to(socketToRoom[socket.id]).emit("User picking word", socketToUserName.get(socketID), roundToRoom[socketToRoom[socket.id]]);
                        io.to(socketID).emit("Pick A Word", wordList);
                        
                    },2000);
                }
               
            }

    },1000);

    socket.on("Chose word", (word) => {
        console.log(word);
        io.to(socketToRoom[socket.id]).emit("User is drawing", socketToUserName.get(socket.id), word);
        
        roundGoing[socketToRoom[socket.id]] = true;
        startRound(socketToRoom[socket.id]);
    });

    socket.on("disconnect",() => {
        console.log("Client disconnected!");
        let roomid = socketToRoom[socket.id];
        let room = users[roomid];
        if (room){
            room = room.filter( id => id!==socket.id);
            users[roomid] = room;
        }
        let newsocketToRoom = {}
        Object.keys(socketToRoom).map((keyName,keyNumber) => {
            if (keyName !== socket.id){
                newsocketToRoom[keyName] = socketToRoom[keyName];
            }
        });

        console.log(newsocketToRoom);
        socketToRoom = newsocketToRoom;

        Object.keys(UserNameToSocket).map((keyName, keyNumber ) => {
            if (keyName == socketToUserName.get(socket.id)){
                let sockets = UserNameToSocket[keyName];
                if (sockets){
                    sockets = sockets.filter( id => id !== socket.id);
                    UserNameToSocket[keyName] = sockets;
                }
            }
        });

        
        socketToUserName.delete(socket.id);
        console.log("socketToUserName", socketToUserName);
        
        io.to(roomid).emit("User disconnected", room, Array.from(socketToUserName));
        console.log("After disconnection: ",room, socketToUserName);
    });

});
