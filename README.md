# CS1534-CA4

## Contents

-   [Introduction](#introduction)
-   [Running](#running)
-   [Heroku](#heroku)
-   [Challenges](#challenges)
-   [Details](#details)

## Introduction

This is a portfolio and chat application using a node server, that can be run using the commands in the [Running](#running) section.

## Running

To run type into the terminal either `npm run start` or `node index.js`, then open the box url at port 5000.

## Heroku

[Here](https://arman-chat-app-ec32a39cf8d5.herokuapp.com/) is the link to the Heroku of this site

## Challenges

The main problem I had was to do with the navbar, I originally wanted a collapsible burger navbar then made itself smaller in mobile mode, then bigger in desktop mode, however I could not get it to work so I compromised and went with a basic navbar.
Another problem I had was learning how sockets work, but after some trial and error I found that it works by sending a message to the server from the client, and from the server to the client, never from client to client.

## Details

The server uses node.js as a base and uses the npm packages socket.io and express to host a server using the `index.js` file as the server. The server hosts the directory `public` as the content, so the `index.html` in public is the home, this then links the `chat.html` and `about.html` in the navbar. The server is hosted on the port 5000, unless the environmental variable PORT is declared then it uses that, this was done to allow this application to be hosted on Heroku [here](https://arman-chat-app-ec32a39cf8d5.herokuapp.com/). The server works with the clients by using socket.io, the server and client emit and receive messages from each other by using the package. The server is listening on the clients' emits of `validate user`, `new user`, `disconnect`, `chat message`and `typing`. The client is listening to the server's of `script manipulated`, `user validated`, `new user`, `user joined`, `user disconnected`, `chat message` and `typingStatus`. The server listens on the clients' emits and the client listens on the server's emits. This allows them to communicate, validate messages and send messages.

### Emits

The `validate user` is sent to the server to check if the username entered by the user is valid, eg does not have a forbidden char that breaks the query selector eg `<, > , &, + and etc` or if the user name was already in use. If the user has a valid username then the server emits `user validated` message with the id, username and validated true, if the username was in use it would send a reply of non-valid username, however if the username had an invalid username because of an illegal character then that means they have changed the client side validation so an emit of `script manipulated`is called.
The `user validated` emit is called by the server to tell the client if they have a valid username, so they can continue, and to re-ask if its currently in use.
The `disconnected` is a built in command from socket if it detects if a client disconnects, it then causes the server to emit a [`user disconnected`]to the user
The `script manipulated` is emitted by the server if it detects if the client side javascript's validation has been removed, it sends an alert to the user then force reloads their page.
The `new user` emit is sent by the client to tell the server a new user is connected, os it tell the other clint's to add then to the active user box, it is also sent by client to tell other users a new user has joined.
The `user joined` emit is only listed to once by a client, it basically used to end the chat history to new users.
The `chat message` command is called by both the server and client side, the client does this when a person send s message, this message then validated by the server, then is send to the other clients using this, the clients listen to this and check if it was sent by themselves, if it it is then it displays on the right side of the message box, if it isn't, then it goes on the left side.
`typing` is sent to the server when the client detects a keypress in the input box or when the user loses focus on it, this is then sent to the other users to show typing status, sent on the key of `typingStatus`
