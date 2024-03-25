# CS1534-CA4

## Contents

-   [Introduction](#introduction)
-   [Running](#running)
-   [Heroku](#heroku)
-   [Development approach](#development-approach)
-   [Challenges](#challenges)
-   [Details](#details)
    -   [Emits](#emits)

## Introduction

This is a portfolio and chat application using a node server, that can be run using the commands in the [Running](#running) section.

## Running

To run type into the terminal either `npm run start` or `node index.js`, then open the box url at port 5000. Make sure you run `npm install` before running to make sure all modules are installed.

## Heroku

[Here](https://arman-chat-app-ec32a39cf8d5.herokuapp.com/) is the link to the Heroku of this site

## Development approach

My approach on making the website was to focus on the base aesthetics, then work on polishing off the chat application, add then adding the content for my portfolio then refocussing on the css to fit my theme.

For extras, I have used the fontawesome's library of icons for my notification and clear chat button. The attempt was fairly successful, as the icons can change colour allowing me to make the notification icon to switch between red and green as needed. The integrate them I just had to call their library in the script tag at the bottom of the html. The rationale was that the icons would be quicker convey their message than the text, using colour as the identifier.

The other extra I am using is bootstrap, mostly for their css features for the `container` class. TO add them I just added them to the `head` tag in the html. The rationale was that they looked nice in my CA3, so I added them to my CA4.

I also added a notification noise if the user activates their notifications.

For another extra I using the npm package `axios` and a REST API to link my news pages and my news getters in the server. When the user opens the `news.html` it calls the rest api of the server, which uses axios to fetch the top 50 news articles on google news using the `ok.surf` api or the current space articles on the `spaceflightnewsapi`. The server then trims the json for the top 30 for tech news, then sends it back to the client which parses it for the source, link, article image and title of the article, if its space news it also parses fro the summary. It then displays this to the user. The attempt was not hard, but could be more fully fleshed out with the summary of the article for the tech news if I used a more advanced API, however `ok.surf` was the only news api that did not need an API key or account to work. The integration was simple, as it just required I make an api in my server for that listened to `/api/tech_news` and another at `/api/space_news` for space news.

I followed the design philosophy of my CA3, by have a nice static background image that switches between a landscape or portrait version for phone and desktop screens, and `div`s to hold and separate my content, via the `container` class in bootstrap, overriding on its colour, margins and padding. The `container` class creates a clear separator for my content.

## Challenges

The main problem I had was to do with the navbar, I originally wanted a collapsible burger navbar then made itself smaller in mobile mode, then bigger in desktop mode, however I could not get it to work so I compromised and went with a basic navbar. I then dedicated a an hour to do an got it working.
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
