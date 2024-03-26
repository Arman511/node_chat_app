const express = require("express");
const socket = require("socket.io");
const axios = require("axios");

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
    //Validate username
    socket.on("validate user", function (data) {
        if (
            data.user === null ||
            data.user === "" ||
            /^-?\d+$/.test(data.user[0]) ||
            data.user.includes(" ") ||
            /<\/?[a-z][\s\S]*>/i.test(data.user) ||
            data.user.length > 20 ||
            data.user.length < 3 ||
            data.user.includes("<") ||
            data.user.includes(">") ||
            data.user.includes("&") ||
            data.user.includes('"') ||
            data.user.includes("'") ||
            data.user.includes("/") ||
            data.user.includes("\\") ||
            data.user.includes("=") ||
            data.user.includes("(") ||
            data.user.includes(")") ||
            data.user.includes(";") ||
            data.user.includes(":") ||
            data.user.includes(",") ||
            data.user.includes("[") ||
            data.user.includes("]") ||
            data.user.includes("{") ||
            data.user.includes("}") ||
            data.user.includes("!") ||
            data.user.includes("?") ||
            data.user.includes("*") ||
            data.user.includes("#") ||
            data.user.includes("$") ||
            data.user.includes("%") ||
            data.user.includes("^") ||
            data.user.includes("@") ||
            data.user.includes("~") ||
            data.user.includes("`") ||
            data.user.includes("|") ||
            data.user.includes("+") ||
            data.user.includes("-")
        ) {
            io.emit("script manipulated", {
                user: data.user,
                id: data.id,
            });
            return;
        }
        if (activeUsers.has(data.user)) {
            io.emit("user validated", {
                user: data.user,
                id: data.id,
                validated: false,
            });
        } else {
            io.emit("user validated", {
                user: data.user,
                id: data.id,
                validated: true,
            });
        }
    });
    //New user joins
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
    //User disconnects
    socket.on("disconnect", function () {
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
    });
    //Chat message
    socket.on("chat message", function (data) {
        // Check if the message contains a <script> tag
        if (data.message.includes("<script>")) {
            console.log("Message contains JavaScript code.");
            io.emit("script manipulated", data.nick);
            return;
        }
        if (data.message.length > 300) {
            console.log("Message too long");
            io.emit("script manipulated", data.nick);
            return;
        }

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
    //Typing status
    socket.on("typing", (data) => {
        io.emit("typingStatus", data);
    });
});
// Define API endpoint
app.get("/api/tech_news", async (req, res) => {
    try {
        const response = await axios.post(
            "https://ok.surf/api/v1/news-section",
            {
                sections: ["Technology"],
            }
        );

        if (!response.data) {
            throw new Error("Empty response received");
        }
        let news_data = response.data.Technology.slice(0, 30);
        return res.json(news_data);
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/space_news", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.spaceflightnewsapi.net/v4/articles/"
        );

        if (!response.data) {
            throw new Error("Empty response received");
        }
        let news_data = response.data.results;
        return res.json(news_data);
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
const pwd = process.cwd();
// Catch all get errors
app.use(function (req, res, next) {
    res.status(404).sendFile(`/${pwd}/public/error.html`);
});
