/**
 * Created by andy on 30/06/15.
 */
var anim = new wordFun.animator();

document.getElementById('word-fun-input').addEventListener('keypress', anim.fire.bind(anim));
document.getElementById('pause').addEventListener('click', anim.pauseToggle.bind(anim));
document.getElementById('word-fun-input').focus();