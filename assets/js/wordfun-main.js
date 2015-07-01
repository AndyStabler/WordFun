/**
 * Created by Andy Stabler
 */
var anim = new wordFun.animator();

document.getElementById('word-fun-input').addEventListener('keypress', anim.fire.bind(anim));
document.getElementById('pause-toggle').addEventListener('click', anim.pauseToggle.bind(anim));
document.getElementById('word-fun-input').focus();