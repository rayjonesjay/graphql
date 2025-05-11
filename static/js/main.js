// let resetTimerId;
// function checkInteraction(e) {
//     e.preventDefault();
//     clearInterval(resetTimerId);
//
//     resetTimerId = setInterval(() => {
//         console.log("no interaction detected...logging user out");
//         localStorage.removeItem("jwt");
//         window.location.href = '/';
//         window.refresh = true;
//     },1738)
// }
//
// document.addEventListener('scroll',checkInteraction)
// document.addEventListener('mousemove',checkInteraction)
// document.addEventListener('click',checkInteraction)
