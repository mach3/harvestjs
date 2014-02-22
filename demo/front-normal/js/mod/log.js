

var log = function(msg){
    var li = document.createElement("li");
    li.innerHTML = msg;
    document.getElementById("log").appendChild(li);
};


log("load: log.js");
