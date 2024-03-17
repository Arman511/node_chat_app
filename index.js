const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT || 5000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);
const chat_history = [];
//we use a set to store users, sets objects are for unique values of any type
const activeUsers = new Set();

io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("new user", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        //... is the the spread operator, adds to the set while retaining what was in there already
        io.emit("new user", [...activeUsers]);
        data = {
            user: data,
            chat_history: chat_history,
        };
        io.emit("user joined", data);
    });

    socket.on("disconnect", function () {
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
    });

    socket.on("chat message", function (data) {
        const time = new Date();
        const formattedTime = time.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
        });
        data_with_time = {
            time: formattedTime,
            user: data.nick,
            message: data.message,
        };
        io.emit("chat message", data_with_time);
        chat_history.push(data_with_time);
        if (chat_history.length > 100) {
            chat_history.shift();
        }
    });

    socket.on("typing", (data) => {
        if (data.typing == true) {
            io.emit("typingStatus", data);
        } else {
            io.emit("typingStatus", data);
        }
    });
});
