//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox__people");

let userName = "";
let id;
var typing = false;

var firstTime = true;

const newUserConnected = function (data) {
    //give the user a random unique id
    id = Math.floor(Math.random() * 1000000);
    //prompt the user for their username
    userName = prompt("Enter your username: ");
    while (true) {
        if (
            userName === null ||
            userName === "" ||
            /^-?\d+$/.test(userName[0])
        ) {
            userName = prompt(
                "Enter your username, make sure the first letter is not a number): "
            );
        } else {
            break;
        }
    }
    //console.log(typeof(userName));

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
newUserConnected();

const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

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
            console.log(message);
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

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }
    if (inputField.value.length > 300) {
        alert("Message too long");
        return;
    }

    if (/<\/?[a-z][\s\S]*>/i.test(inputField.value)) {
        alert("Invalid input. HTML code is not allowed.");
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });
    console.log(userName);
    inputField.value = "";
});

socket.on("chat message", function (data) {
    addNewMessage({ time: data.time, user: data.user, message: data.message });
});

inputField.addEventListener("keypress", () => {
    socket.emit("typing", { typing: true, nick: userName });
});
inputField.addEventListener("blur", () => {
    socket.emit("typing", { typing: false, nick: userName });
});

socket.on("typingStatus", function (data) {
    var user = document.getElementById(data.nick);
    if (data.typing == true) {
        user.innerHTML = `<h5 id="${data.nick}">${data.nick} is typing...</h5>`;
    } else {
        user.outerHTML = `<h5 id="${data.nick}">${data.nick}</h5>`;
    }
});

const send_link = document.getElementById("send_link");
const send_img = document.getElementById("send_img");

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
    const message = `<img src="${link}" alt="Image" width="300" height="300">`;
    socket.emit("chat message", {
        message: message,
        nick: userName,
    });
});
