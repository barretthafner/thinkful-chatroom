var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var userStorage = {
    list: [],
    findUser: function (socket) {
        var found = false;
        this.list.forEach(function (user, index) {
            if (user.id === socket.id) {
                found = user;
            };
        });
        return found;
    },
    removeUser: function (socket){
        var found = false;
        this.list.forEach(function(user, index, arr) {
           if (user.id === socket.id) {
                found = user;
                arr.splice(index, 1);
           }
        });
        return found;
    },
    setTyping: function(socket) {
        var setTyping = false;
        this.list.forEach(function(user, index, arr) {
           if (user.id === socket.id) {
                if (user.typing === false) {
                    user.typing = true;
                    setTyping = true;
                }
           }
        });
        return setTyping;
    },
    unSetTyping: function(socket) {
        var unSetTyping = false;
        this.list.forEach(function(user, index, arr) {
           if (user.id === socket.id) {
                if (user.typing === true) {
                    user.typing = false;
                    unSetTyping = true;
                }
           }
        });
        return unSetTyping;
    }
};

var users = userStorage.list;

io.on('connection', function (socket) {

    socket.on('new user', function(username) {
        // console.log(username + " connected");
        var newUser = {
            username: username,
            id: socket.id,
            typing: false
        }
        users.push(newUser);
        io.emit('message', username + ' joined the chat');
        io.emit('update users', users);
    });
    
    socket.on('message', function(message) {
        
        var user = userStorage.findUser(socket);
    
    //   console.log('Recieved message from: ', user.username);
    //   console.log('It Says: ', message);

        io.emit('message', user.username + ": " + message);
    });
    
    socket.on('typing', function() {
        if (userStorage.setTyping(socket)) {
            io.emit('update users', users);
        }
    });
    
    socket.on('untyping', function() {
       if (userStorage.unSetTyping(socket)) {
            io.emit('update users', users);
       } 
    });
    
    socket.on('disconnect', function(){
        
        var user = userStorage.removeUser(socket);

        // console.log(user.username, "disconnected");
        socket.broadcast.emit('message', user.username + ' left the chat');
        socket.broadcast.emit('update users', users);

    });
});

server.listen(8080);