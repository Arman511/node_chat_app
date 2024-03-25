//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const audio = new Audio("assets/ping.mp3");

let userName = "";
let id;
var typing = false;

var firstTime = true;
var notifications = false;

const promptUserName = function () {
    id = Math.floor(Math.random() * 1000000);
    userName = prompt("Enter your username, or enter nothing to be a guest: ");
    if (userName === "" || userName === null) {
        userName = "Guest_" + id;
        socket.emit("validate user", { user: userName, id: id });
        return;
    }
    while (true) {
        if (
            /^-?\d+$/.test(userName[0]) ||
            userName.includes(" ") ||
            /<\/?[a-z][\s\S]*>/i.test(userName) ||
            userName.length > 20 ||
            userName.length < 3 ||
            userName.includes("<") ||
            userName.includes(">") ||
            userName.includes("&") ||
            userName.includes('"') ||
            userName.includes("'") ||
            userName.includes("/") ||
            userName.includes("\\") ||
            userName.includes("=") ||
            userName.includes("(") ||
            userName.includes(")") ||
            userName.includes(";") ||
            userName.includes(":") ||
            userName.includes(",") ||
            userName.includes("[") ||
            userName.includes("]") ||
            userName.includes("{") ||
            userName.includes("}") ||
            userName.includes("!") ||
            userName.includes("?") ||
            userName.includes("*") ||
            userName.includes("#") ||
            userName.includes("$") ||
            userName.includes("%") ||
            userName.includes("^") ||
            userName.includes("@") ||
            userName.includes("~") ||
            userName.includes("`") ||
            userName.includes("|") ||
            userName.includes("+") ||
            userName.includes("-")
        ) {
            userName = prompt("Invalid username enter another username: ");
        } else {
            break;
        }
    }

    socket.emit("validate user", { user: userName, id: id });
};

socket.on("user validated", function (data) {
    if (data.id === id && data.validated === true && userName === data.user) {
        newUserConnected();
    } else if (
        data.id === id &&
        data.validated === false &&
        userName === data.user
    ) {
        alert("Username already taken. Please enter another username.");
        promptUserName();
    }
});

const newUserConnected = function (data) {
    //give the user a random unique ids
    //prompt the user for their username

    //emit an event with the user id
    var nametag = document.getElementById("nametag");
    nametag.innerHTML = `You are ${userName}`;
    socket.emit("new user", userName);
    //call
    addToUsersBox(userName);
};

const addToUsersBox = function (userName) {
    //This if statement checks whether an element of the user-userlist
    //exists and then inverts the result of the expression in the condition
    //to true, while also casting from an object to boolean
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    }

    //setup the divs for displaying the connected users
    //id is set to a string including the username
    const userBox = `
    <div class="chat_id ${userName}-userlist">
      <h5 id="${userName}">${userName}</h5>
    </div>
  `;
    //set the inboxPeople div with the value of userbox
    inboxPeople.innerHTML += userBox;
};

//call

const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

//when a user joins
socket.on("user joined", function (data) {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });
    if (firstTime) {
        firstTime = false;
        data.chat_history.map(function (message) {
            addNewMessage({
                time: message.time,
                user: message.user,
                message: message.message,
            });
        });
        const message = `<div class="outgoing__message message you_have_joined">
        <div class="sent__message">
        <p>You ${data.user} have joined - <span class="time_date">${formattedTime}</span></p>
        </div>
        </div>`;
        messageBox.innerHTML = message + messageBox.innerHTML;
        return;
    }

    //add a message to the chatbox
    const message = `<div class="incoming__message message user_joined">
    <div class="sent__message">
    <p>${data.user} has joined - <span class="time_date">${formattedTime}</span></p>
    </div>
    </div>`;
    messageBox.innerHTML = message + messageBox.innerHTML;
});

//when a new user event is detected
socket.on("new user", function (data) {
    data.map(function (user) {
        return addToUsersBox(user);
    });
});
//when a user leaves
socket.on("user disconnected", function (leftUserName) {
    document.querySelector(`.${leftUserName}-userlist`).remove();

    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });
    //add a message to the chatbox
    const message = `<div class="incoming__message message user_left">
    <div class="sent__message">
    <p>${leftUserName} has left - <span class="time_date">${formattedTime}</span></p>
    </div>
    </div>`;
    messageBox.innerHTML = message + messageBox.innerHTML;
});
//add a new message to the chatbox
const addNewMessage = ({ time, user, message }) => {
    const receivedMsg = `
    <div class="incoming__message message">
    <div class="received__message">
    <p>${message}</p>
    <div class="message__info">
    <span class="message__author">${user}</span>
    <span class="time_date">${time}</span>
    </div>
    </div>
    </div>`;

    const myMsg = `
    <div class="outgoing__message message">
    <div class="sent__message">
    <p>${message}</p>
    <div class="message__info">
    <span class="time_date">${time}</span>
    </div>
    </div>
    </div>`;

    //is the message sent or received
    messageBox.innerHTML =
        (user === userName ? myMsg : receivedMsg) + messageBox.innerHTML;
};
//when a user sends a message
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }
    // Check if the message is too long
    if (inputField.value.length > 300) {
        alert("Message too long");
        return;
    }
    // Check if the message contains a html tags
    if (/<\/?[a-z][\s\S]*>/i.test(inputField.value)) {
        alert("Invalid input. HTML code is not allowed.");
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });
    inputField.value = "";
});
//when a message is received
socket.on("chat message", function (data) {
    addNewMessage({ time: data.time, user: data.user, message: data.message });
    if (notifications && data.user !== userName) {
        audio.play();
    }
});
//when a user is typing
inputField.addEventListener("keypress", () => {
    socket.emit("typing", { typing: true, nick: userName });
});
inputField.addEventListener("blur", () => {
    socket.emit("typing", { typing: false, nick: userName });
});
//when a user is typing
socket.on("typingStatus", function (data) {
    var user = document.getElementById(data.nick);
    if (data.typing == true) {
        user.innerHTML = `<h5 id="${data.nick}">${data.nick} is typing...</h5>`;
    } else {
        user.innerHTML = `<h5 id="${data.nick}">${data.nick}</h5>`;
    }
});
//if the server detects user has changed the javascript of the page, force reloads their page
socket.on("script manipulated", function (data) {
    if (data.user === userName && data.id === id) {
        alert("Invalid input. HTML code is not allowed.");
        location.reload();
    }
});

const send_link = document.getElementById("send_link");
const send_img = document.getElementById("send_img");
const notification_button = document.getElementById("notification_button");
//when the notification button is clicked
notification_button.addEventListener("click", function () {
    if (notifications) {
        notifications = false;
        notification_button.classList.add("fa-bell-slash");
        notification_button.classList.remove("fa-bell");
    } else {
        notifications = true;
        notification_button.classList.add("fa-bell");
        notification_button.classList.remove("fa-bell-slash");
    }
});
//when the send link button is clicked
send_link.addEventListener("click", function () {
    var link = prompt("Enter the link: ");
    if (link === null || link === "") {
        return;
    }
    if (link.length > 300) {
        alert("Link too long");
        return;
    }
    if (/<\/?[a-z][\s\S]*>/i.test(link)) {
        alert("Invalid input. HTML code is not allowed.");
        return;
    }
    if (!link.startsWith("http")) {
        link = "https://" + link;
    }
    const message = `<a href="${link}" target="_blank">${link}</a>`;
    socket.emit("chat message", {
        message: message,
        nick: userName,
    });
});
//when the send image button is clicked
send_img.addEventListener("click", function () {
    var link = prompt("Enter the image link: ");
    if (link === null || link === "") {
        return;
    }
    if (link.length > 300) {
        alert("Link too long");
        return;
    }
    if (/<\/?[a-z][\s\S]*>/i.test(link)) {
        alert("Invalid input. HTML code is not allowed.");
        return;
    }
    if (!/\.(jpg|png|webp|gif)$/.test(link)) {
        alert(
            "Invalid image format. Only JPG, PNG, WEBP, and GIF are allowed."
        );
        return;
    }
    const message = `<img src="${link}" alt="Image"  style="width: 60%">
        <br>
        <a href="${link}" target="_blank">Link to image</a>`;
    socket.emit("chat message", {
        message: message,
        nick: userName,
    });
});
//call
promptUserName();
