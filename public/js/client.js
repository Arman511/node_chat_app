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
      <h5>${userName}</h5>
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
    if (firstTime) {
        firstTime = false;
        return;
    }

    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });
    //add a message to the chatbox
    const message = `<div class="incoming__message message user_joined">
        <div class="sent__message">
          <p>${data} has joined - <span class="time_date">${formattedTime}</span></p>
        </div>
      </div>`;
    messageBox.innerHTML += message;
});

//when a new user event is detected
socket.on("new user", function (data) {
    data.map(function (user) {
        return addToUsersBox(user);
    });
});
//when a user leaves
socket.on("user disconnected", function (userName) {
    document.querySelector(`.${userName}-userlist`).remove();

    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });
    //add a message to the chatbox
    const message = `<div class="incoming__message message user_left">
    <div class="sent__message">
      <p>${userName} has left - <span class="time_date">${formattedTime}</span></p>
    </div>
  </div>`;
    messageBox.innerHTML += message;
});
const addNewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });

    const receivedMsg = `
  <div class="incoming__message message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

    const myMsg = `
  <div class="outgoing__message message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

    //is the message sent or received
    messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });

    inputField.value = "";
});

socket.on("chat message", function (data) {
    addNewMessage({ user: data.nick, message: data.message });
});
