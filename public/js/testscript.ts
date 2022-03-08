var socket = io();

var form = document.getElementById('form');
var input = document.getElementById('input');

const questions = [
    {
        question: "What country is the largest by area?",
        a: "Canada",
        b: "USA",
        c: "China",
        correct: "a"
    },
    {
        question: "What country is the smallest by area?",
        a: "Lesotho",
        b: "Switzerland",
        c: "Monaco",
        correct: "c"
    },
    {
        question: "What country is the most populous?",
        a: "Bangladesh",
        b: "Nigeria",
        c: "Russia",
        correct: "b"
    },
    {
        question: "What country is the largest by area?",
        a: "Sweden",
        b: "Denmark",
        c: "Norway",
        correct: "b"
    },
    {
        question: "What country is the most populous?",
        a: "Spain",
        b: "Venezuela",
        c: "Morocco",
        correct: "b"
    },
    {
        question: "What country is closest to the equator?",
        a: "Egypt",
        b: "South Africa",
        c: "Yemen",
        correct: "c"
    }
];
const quiz = document.getElementById("quiz_container");
const player_answers = document.querySelectorAll('input[name="answer"]');
const element_question = document.getElementById("the_question");
const question_label_a = document.getElementById("label_a");
const question_label_b = document.getElementById("label_b");
const question_label_c = document.getElementById("label_c");
const done_button = document.getElementById("done_button");
var cur_quiz = 0;
var cur_score = 0;

const inserted_name = prompt('What is your name?')
socket.emit('new-user', inserted_name)
//update_scoreboard();

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
    }
});

socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
});
socket.on('update-score', new_score => {
    document.getElementById("opponent_score").innerHTML = "".concat(new_score);
});
socket.on('user-connected', name => {
    var item = document.createElement('li');
    item.textContent = 'New user connected: '+name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
});   
socket.on('user-disconnected', name => {
    var item = document.createElement('li');
    item.textContent = 'User disconnected: '+name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
}); 
socket.on('scoreboard-update', input_scoreboard => {
    while (opponent_score.hasChildNodes()) {
        opponent_score.removeChild(opponent_score.firstChild);
    }
    let scoreboard: player_data[];
    scoreboard = input_scoreboard;
    scoreboard.forEach( (element) => {
        var username = document.createElement('li');
        var score = document.createElement('li');  
        username.textContent = element?.[1];
        score.textContent = element?.[0];  
        opponent_score.appendChild(username);   
        opponent_score.appendChild(score);   

    });
}); 



function update_scoreboard(){
    socket.emit("scoreboard-update",cur_score);
};


/* ##### QUIZ LOGIC ##### */

load_quiz();
function load_quiz() {
    const cur_quiz_data = questions[cur_quiz];
    element_question.innerText = cur_quiz_data.question;
    question_label_a.innerText = cur_quiz_data.a;
    question_label_b.innerText = cur_quiz_data.b;
    question_label_c.innerText = cur_quiz_data.c;
}
function check_player_answer() {
    player_answers.forEach((answer) => {
        if((answer as HTMLInputElement).checked)
        {
            if((answer as HTMLInputElement).id === questions[cur_quiz].correct)
            {
                cur_score++;
                update_scoreboard();
            }
            (answer as HTMLInputElement).checked = false;
        }
    });
}
done_button.addEventListener("click", () => {
    check_player_answer();
    cur_quiz++;
    if (cur_quiz < questions.length) {
        document.getElementById("your_score").innerHTML = `${cur_score}`
        load_quiz();
    }
    else {
        quiz.innerHTML = `<div>You got ${cur_score} out of ${questions.length} </div><button onclick="location.reload()">Reload</button>`;
    }
});

/* ##### END OF QUIZ LOGIC ##### */