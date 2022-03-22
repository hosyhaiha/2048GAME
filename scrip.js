var size = 4;
var score = 0;
var names = "";
var htmlElements;
var cells;
var listCharts = [];
var button = document.getElementById('btn-newgame');

var firebaseConfig = {
    apiKey: "AIzaSyBZ7oPs-_usfTmKnu5YwdDIt9b0OR0ZjBs",
    authDomain: "test-259de.firebaseapp.com",
    databaseURL: "https://test-259de-default-rtdb.firebaseio.com",
    projectId: "test-259de",
    storageBucket: "test-259de.appspot.com",
    messagingSenderId: "287613182187",
    appId: "1:287613182187:web:35d5aad9141f8049045eae",
    measurementId: "G-DZ0N02SHZF"
};

firebase.initializeApp(firebaseConfig);
// Get a reference to the database service
var database = firebase.database();

//firebase function
function wirteToFirebase() {
    var writeok = true;
    for (let index = 0; index < listCharts.length; index++) {
        if (names == listCharts[index].Player && score < listCharts[index].Score)
            writeok = false;
    }

    if (writeok == true) {
        database.ref("/" + names).set({
            Player: names,
            Score: score
        });
    }
}


// database.ref().on("value", function(snapshot) {
//     var term;
//     term = snapshot.val();
//     console.log(term);
// })
function getListCharts() {
    database.ref().orderByChild("Score").on("value", function(snapshot) {
        listCharts = addToList(snapshot);

        var size = listCharts.length;
        for (let index = 1; index <= 5; index++) {
            document.getElementById("chartstop" + index).innerHTML = "TOP " + index + ": " + listCharts[size - index].Player + ": " + listCharts[size - index].Score;
        }
    })
}

function addToList(snapshot) {
    var list = [];
    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        list.push(item);
    });
    return list
}

// popup
let btnPopup = document.getElementById("btn-howtoplay");
let popup = document.querySelector(".popup");
btnPopup.onclick = function() {
    popup.style.display = "block"
}

window.onclick = function(e) {
    if (e.target == popup) {
        popup.style.display = "none"
    }
}

function createTableGame() {
    if (htmlElements) {
        return;
    } else {
        htmlElements = [];
        var table = document.getElementById('field');
        for (var y = 0; y < size; y++) {
            var tr = document.createElement('tr');
            var trElements = [];
            for (var x = 0; x < size; x++) {
                var td = document.createElement('td');
                td.setAttribute('class', 'cell');
                tr.appendChild(td);
                trElements.push(td);
            }
            htmlElements.push(trElements);
            table.appendChild(tr);
        }
    }

}

function createCell() {
    cells = [];
    for (var y = 0; y < size; y++) {
        cells.push(new Array(size).fill(0));
    }
}

function generateInEmptyCell() {
    var x, y;
    do {
        x = Math.floor(Math.random() * size), y = Math.floor(Math.random() * size);
        if (cells[y][x] == 0) {
            cells[y][x] = Math.random() >= 0.9 ? 4 : 2;
            break;
        }
    } while (true);
}

function draw() {
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            var td = htmlElements[y][x];
            var v = cells[y][x];
            td.innerHTML = v == 0 ? '' : String(v);
            if (v == 0) {
                td.setAttribute('style', 'background-color: white');
            } else {
                var h = 55 * v;
                td.setAttribute('style', 'background-color: hsl(' + h + ', 100%, 70%)');
            }
        }
    }
}

function slide(array, size) {
    // [0, 2, 2, 2] => [2, 2, 2] => [4, 0, 2] => [4, 2] => [4, 2, 0, 0]
    function filterEmpty(a) {
        return a.filter(x => x != 0);
    }

    array = filterEmpty(array);

    for (var i = 0; i < array.length - 1; i++) {
        if (array[i] == array[i + 1]) {
            array[i] *= 2;
            array[i + 1] = 0;
            score += array[i];
            // console.log(score);
            document.getElementById("score").innerHTML = "Score: " + score
            wirteToFirebase();

        }
    }

    array = filterEmpty(array);
    while (array.length < size) {
        array.push(0);
    }
    return array;
}

function slideLeft() {
    var changed = false;
    for (var y = 0; y < size; y++) {
        var old = Array.from(cells[y]);
        cells[y] = slide(cells[y], size);
        changed = changed || (cells[y].join(',') != old.join(','));
    }
    return changed;
}


//swap(x, y, y, x);
//     1  2  2  1
//cells[y][x] = cells[x][y];
function swap(x1, y1, x2, y2) {
    var tmp = cells[y1][x1];
    cells[y1][x1] = cells[y2][x2];
    cells[y2][x2] = tmp;
}

function flipTableVetical() {
    for (var y = 0; y < size; y++) {
        for (var xLeft = 0, xRight = size - 1; xLeft < xRight; xLeft++, xRight--) {
            swap(xLeft, y, xRight, y);
        }
    }
}

function flipTableDiagonal() {
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < y; x++) {
            swap(x, y, y, x);
        }
    }
}

function moveLeft() {
    return slideLeft();
}

function moveRight() {
    flipTableVetical();
    var changed = moveLeft();
    flipTableVetical();
    return changed;
}

function moveUp() {
    flipTableDiagonal();
    var changed = moveLeft();
    flipTableDiagonal();
    return changed;
}

function moveDown() {
    flipTableDiagonal();
    var changed = moveRight();
    flipTableDiagonal();
    return changed;
}


function gameOver() {
    //check 1 lượt nếu còn ô nào mà giá trị đang là 0 thì vẫn chơi đc tiếp
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            if (cells[y][x] == 0) {
                return false;
            }
        }
    }
    //Nếu khác không và ô đó bằng ô phía dưới hoặc bằng ô bên cạnh thì chơi được tiếp
    for (var y = 0; y < size - 1; y++) {
        for (var x = 0; x < size - 1; x++) {
            var c = cells[y][x]
            if (c != 0 && (c == cells[y + 1][x] ||
                    c == cells[y][x + 1] ||
                    cells[y + 1][x + 1] == cells[y][x + 1] ||
                    cells[y + 1][x + 1] == cells[y + 1][x])) {
                return false;
            }

        }
    }
    //End Game
    return true;
}

document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
}, false);

document.addEventListener('keydown', function(e) {
    var code = e.keyCode;
    var ok;
    switch (code) {
        case 40:
            ok = moveDown();
            break;
        case 38:
            ok = moveUp();
            break;
        case 37:
            ok = moveLeft();
            break;
        case 39:
            ok = moveRight();
            break;
        case 73:
        case 74:
        case 83:
        case 123:
            disabledEvent(e);
        default:
            return;
    }
    if (ok) {
        generateInEmptyCell();
        draw();
    }
    if (gameOver()) {
        alert('Game over');
    }

    function disabledEvent(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else if (window.event) {
            window.event.cancelBubble = true;
        }
        e.preventDefault();
        return false;
    }
});

button.addEventListener("click", function(e) {

    var ok = confirm("Are you sure ?");
    if (ok == true) {
        createTableGame();
        createCell();
        new Array(3).fill(0).forEach(generateInEmptyCell);
        score = 0;
        document.getElementById("score").innerHTML = "Score: " + score
        draw();
    }
});

function loadGame() {
    getListCharts();
    names = prompt("What your name");
    if (names == null || names.trim() == "") {
        window.location.reload();
    }
    document.getElementById("name").innerHTML = "Player: " + names;
    createTableGame();
    createCell();
    new Array(3).fill(0).forEach(generateInEmptyCell);
    draw();
}

loadGame();