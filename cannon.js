// Logic of game.
var canvas;
var context;

// Constants for game play
var target_pieces = 7;
var miss_penalty = 3;
var hit_reward = 2;
var time_interval = 25; /*screen refresh in millisec*/

// variables for game loop and tracking stats.
var interval_timer;/*holds interval timer.*/
var timer_count; /*times the timer fired since the last sec.*/
var time_left;
var shots_fired;
var time_elapsed; /*no. of seconds elapsed*/

// variale for the blocker and the target
var blocker;
var blocker_distance;
var blocker_beginning; /*measures blocker distance from top*/
var blocker_end; /* blocker's lower edge distance from top*/
var initial_blocker_velocity; /*initial blocker speed multiplier*/
var blocker_velocity; /*blocker speed multiplier during game*/

var target; /*start and end point of target*/
var target_distance; /*target distance from left*/
var target_beginning; /*target distance from top*/
var target_end; /*target's bottom distance from top*/
var piece_length; /*length of a target piece*/
var initial_target_velocity;
var target_velocity;

var line_width; /*width of the target and the blocker*/
var hit_states;/*is each target piece hits*/
var target_piece_hit; /*number of target pieces hit*/

// variable for cannon and cannonballs;
var cannonball;
var cannonball_velocity;
var cannonball_on_screen;
var cannonball_radious;
var cannonball_speed;
var cannonbase_radious;
var cannon_length;
var barrel_end;
var canvas_width;
var canvas_height;

// variable for sounds
var target_sound;
var cannon_sound;
var blocker_sound

// Called when the app first launches
function setup_game() {
    // stop timer if document unload event occurs
    document.addEventListener("unload",stop_timer,false);

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    // start a new game when user clicks start game button
    document.getElementById("startbutton").addEventListener("click",newgame,false);

    // JS objects representing game items
    blocker = new Object(); /*object representing blocker line*/
    blocker.start = new Object(); /*will hold x-y coordsof line start*/
    blocker.end = new Object;/*' ' ' ' line end*/
    target = new Object();
    target.start = new Object();
    target.end = new Object();
    cannonball = new Object();
    barrel_end = new Object();

    // initializes hitstates as an array
    hit_states = new Array(target_pieces);

    // get sounds
    target_sound = document.getElementById("targetsound");
    cannon_sound = document.getElementById("cannonsound");
    blocker_sound = document.getElementById("blockersound");

}/*end function setupgame*/

// setup interval timer to update game
function start_timer(){
    canvas.addEventListener("click" , fire_cannonball , false);
    interval_timer = window.setInterval(updatepositions , time_interval);
}
// terminate interval timer
function stop_timer(){
    canvas.addEventListener("click" , fire_cannonball , false);
    window.clearInterval(interval_timer);
}

// called by function newgame to scale size of new game
function reset_elements(){
    var w = canvas.width;
    var h = canvas.height;
    canvas_width = w;
    canvas_height = h;
    cannonbase_radious = h/9;
    cannon_length = w/8;
    cannonball_radious = w/36;
    cannonball_speed = w * (3/2);

    line_width = w/24;

    // configuring instance variable related to blocker
    blocker_distance = w*(5/8);
    blocker_beginning = h/8;
    blocker_end = h*(3/8);
    initial_blocker_velocity = h/2;
    blocker.start.x = blocker_distance;
    blocker.start.y = blocker_beginning;
    blocker.end.x = blocker_distance;
    blocker.end.y = blocker_end;

    // configuring instance variable related to target
    target_beginning = w*(1/8);
    target_distance = w*(7/8);
    target_end = h *(7/8);
    piece_length = (target_end - target_beginning)/target_pieces;
    initial_target_velocity = h/4;
    target.start.x = target_distance;
    target.start.y = target_beginning;
    target.end.x = target_distance;
    target.end.y = target_end;

    // End point of cannon initially points horizontaly
    barrel_end.x = cannon_length;
    barrel_end.y = h/2;
}/*end function reset element*/

function newgame(){
    reset_elements();/*reinitialize all game elements*/
    stop_timer();/*terminates previous interval timer*/
    
    // set every element of hitstates to false--restores target pieces
    for(var i=0;i<target_pieces;++i)
        hit_states[i] = false;/*target piece not destroyed*/

        target_piece_hit = 0;
        blocker_velocity = initial_blocker_velocity;
        target_velocity = initial_target_velocity;
        time_left = 10;
        timer_count = 0;
        cannonball_on_screen = false;
        shots_fired = 0;
        time_elapsed = 0;

        start_timer();/*starts game loop*/
    
}
// called every time_interval milliseconds
function updatepositions(){
    // update the blocker position
    var blocker_update = (time_interval/1000 * blocker_velocity);
    blocker.start.y += blocker_update;
    blocker.end.y +=blocker_update;

    // update target's position
    var target_update = (time_interval / 1000 * target_velocity);
    target.start.y += target_update;
    target.end.y += target_update;
    
    // if blocker hittop or bottom, reverse direction
    if(blocker.start.y < 0 || blocker.end.y > canvas_height){
        blocker_velocity *= -1;
    }
    if(target.start.y < 0 || target.end.y > canvas_height){
        target_velocity *= -1;
    }

    if(cannonball_on_screen){
        // update cannon ball position
        var interval = time_interval / 1000.0;

        cannonball.x += interval * cannonball_velocityX;
        cannonball.y += interval * cannonball_velocityY;

        // check for collision with blocker
        if(cannonball_velocityX > 0 && cannonball.x + cannonball_radious >= blocker_distance && cannonball.x + cannonball_radious <= blocker_distance + line_width && cannonball.y - cannonball_radious > blocker.start.y && cannonball.y - cannonball_radious < blocker.end.y){
            blocker_sound.play();
            cannonball_velocityX *= -1;/*reverse balll direction*/
            time_left -= miss_penalty;
        }
        // check for collision with right and left walls;
        else if(cannonball.x + cannonball_radious > canvas_width || cannonball.x - cannonball_radious < 0){
            cannonball_on_screen = false;/*remove cannon ball on screen*/
        }
        else if(cannonball.y + cannonball_radious > canvas_height || cannonball.x - cannonball_radious < 0){
            cannonball_on_screen = false;/*remove cannon ball on screen*/
        }

        // check for cannonball collision with target
        else if(cannonball_velocityX > 0 && cannonball.x + cannonball_radious >= target_distance && cannonball.x + cannonball_radious <= target_distance + line_width && cannonball.y - cannonball_radious > target.start.y && cannonball.y - cannonball_radious < target.end.y){
            // determine target section no.(0 is the top)
            var section = Math.floor((cannonball.y - target.start.y) / piece_length);

            // check whether piece hasn't been hit yet
            if((section >= 0 && section < target_pieces) && !hit_states[section]){
                target_sound.play();
                hit_states[section] = true; /*section was hit*/
                cannonball_on_screen = false;/*remove cannonball*/
                time_left += hit_reward;

                // if all pieces have been hit
                if(++target_piece_hit == target_pieces){
                    stop_timer();
                    draw();/*draw game piece one final time*/
                    showGameOverDialog("You Won");/*show winning dialog*/
                }
            }
        }
    }
    ++timer_count;/*increment the timer event counter*/

    // if one second has passed
    if(time_interval * timer_count >= 1000){
        --time_interval;
        ++time_elapsed;
        timer_count=0;
    }

    draw();  /*draw all elements at updated position*/

    // if timer reached 0
    if(time_left <= 0){
        stop_timer();
        showGameOverDialog("You Lost");
    }
}/*end function update position*/

// fires a cannonball
function fire_cannonball(event){
    if(cannonball_on_screen)
    return;

    var angle = align_cannon(event);/*get cannon barrels angle*/

    // make cannonball to be inside cannon
    cannonball.x = cannonball_radious; /*align x coordinate with cannon*/
    cannonball.y = canvas_height / 2;/*centres ball vertically*/

    // get x&y component of total velocity
    cannonball_velocityX = (cannonball_speed * Math.sin(angle)).toFixed(0);
    cannonball_velocityY = (-cannonball_speed * Math.cos(angle)).toFixed(0);
    cannonball_on_screen = true;
    ++shots_fired;

    // play cannon fired sound
    cannon_sound.play();

}/*function ends*/

// allign cannon in response to a mouse click
function align_cannon(event){
    // get location of click
    var click_point = new Object();
    click_point.x = event.x;
    click_point.y = event.y;

    // compute click's distance from centre of screen
    // on y-axis
    var centre_minus_y = (canvas_height /2 - click_point.y);

    var angle = 0;/*initialize angle to 0*/
    
    // calculate angle the barrel makes with horizontal
    if(centre_minus_y !== 0)/*prevent division by 0*/
    {
        angle = Math.atan(click_point.x / centre_minus_y);
    }
    if(click_point.y >canvas_height / 2){
        angle += Math.PI;/*adjusting angle*/
    }
    // calculate end points of cannon's barrel
    barrel_end.x = (cannon_length * Math.sin(angle)).toFixed(0);
    barrel_end.y = (-cannon_length * Math.cos(angle) + (canvas_height / 2)).toFixed(0);

    return angle;

}

// creating game elements
function draw(){
    canvas.width = canvas.width;/*clears canvas*/

    // display time remaining
    context.fillStyle = "black";
    context.font = "bold 24px serif";
    context.textBaseline = "top";
    context.fillText("Time Remaining: " + time_left ,5 ,5);

    // drawing cannon ball on screen
    if(cannonball_on_screen){
        context.fillStyle = "grey";
        context.beginPath();
        context.arc(cannonball.x, cannonball.y, cannonball_radious, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }
    // drawing cannon barrel
    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(0, canvas_height / 2);/*path origin*/
    context.lineTo(barrel_end.x,barrel_end.y);
    context.lineWidth = line_width;
    context.stroke();/*draw path*/

    // draw cannon base
    context.beginPath();
    context.fillStyle = "grey";
    context.arc(0, canvas_height / 2,cannonbase_radious, 0, Math.PI*2);
    context.closePath();
    context.fill();

    // draw blocker
    context.beginPath();
    context.moveTo(blocker.start.x, blocker.start.y);/*path origin*/
    context.lineTo(blocker.end.x,blocker.end.y);
    context.lineWidth = line_width;
    context.stroke();

    // initialise current point to starting point of target
    var current_point = new Object();
    current_point.x = target.start.x;
    current_point.y = target.start.y;

    // draw target
    for(var i=0;i<target_pieces;++i){
        // if this target peice is not hitted draw it
        if(!hit_states[i]){
            context.beginPath();

            // alternate colouring pieces
            if(i%2 === 0){
                context.strokeStyle = "yellow";
            }
            else context.strokeStyle = "blue";

            context.moveTo(current_point.x,current_point.y);
            context.lineTo(current_point.x,current_point.y + piece_length);
            context.lineWidth = line_width;
            context.stroke();
        }

        // move current point to start of next piece
        current_point.y += piece_length;
    }
}






function showGameOverDialog(message){
    alert(message + "\nshots fired: " + shots_fired + "\nTotal time: " + time_elapsed + "seconds");
}
window.addEventListener("load",setup_game, false);
