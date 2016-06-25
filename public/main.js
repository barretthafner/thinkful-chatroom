$(document).ready(function() {
    var socket = io();
    var input = $('input');
    var messages = $('#messages');
    var userList = $('#user-list');
    var username;
    
    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };
    
    var updateUserList = function(users) {
        userList.empty() ;
        userList.append('<h4>User count: ' + users.length);
        users.forEach(function(user) {
           userList.append('<div>' + user.username);
           if (user.typing === true) {
               userList.append('<em> is typing...</em>');
           }
           userList.append('</div>');
        });
    };
    
    
    socket.on('connect', function() {
        username = prompt("Welcome. Please enter your name");
        socket.emit('new user', username);
    });
    
    socket.on('update users', function(users) {
        updateUserList(users);
    });

    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            if (input.val().split('').length === 1 && (event.keyCode === 8 || event.keyCode === 46)) {
                socket.emit('untyping');
            } else if (event.keyCode >= 48 && event.keyCode <= 90 && input.val() === '') {
                socket.emit('typing');
            }
            return;
        }
        
        event.preventDefault();

        socket.emit('message', input.val());
        socket.emit('untyping');
        input.val('');
    });
    
    socket.on('message', function(message) {
        addMessage(message);
    });
});