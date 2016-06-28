$(document).ready(function() {
    var socket = io();
    var input = $('input');
    var messages = $('#messages');
    var userList = $('#user-list');
    
    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };
    
    var updateUserList = function(users) {
        var userString = "";
        
        userString += '<h4>User count: ' + users.length + '</h4>';
        
        users.forEach(function(user) {
           userString += '<div>' + user.username;
           if (user.typing === true) {
               userString += '<em> is typing...</em>';
           }
           userString += '</div>';
        });
        
        userList.html(userString);
    };
    
    
    socket.on('connect', function() {
        var username = prompt("Welcome. Please enter your name");
        socket.emit('new user', username);
    });
    
    socket.on('update users', function(users) {
        updateUserList(users);
    });
    
    socket.on('message', function(message) {
        addMessage(message);
    });

    input.on('keyup', function(event) {
        if (event.keyCode != 13) {
            if ( input.val().length === 0 ) {
                socket.emit('untyping');
            } else if ( input.val().length !== 0 ) {
                socket.emit('typing');
            }
            return;
        }

        socket.emit('message', input.val());
        socket.emit('untyping');
        input.val('');
    });
    

});