const express = require("express")
const http = require("http")
const app = express()

const server = http.createServer(app)

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        method: [ "GET", "POST"]
    }
})


io.on("connection", (socket) => {
    socket.emit("me", socket.id);

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from, name: data.name})
    })

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    })

    socket.on("callEnded", (data) => {
        io.to(data.to).emit("callEnded");
    })

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded");
    })
})
server.listen(6003, () => {
    console.log("listening on port 6003");
})

