let canvas = document.querySelector(".canvas");
window.onresize = function(){
    canvas.width = window.innerWidth-20;
    canvas.height = window.innerHeight-25;
};
window.onresize();
let p = canvas.getContext("2d");//For rendering