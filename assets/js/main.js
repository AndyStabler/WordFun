/**
 * Created by Andy Stabler
 */
var anim = new wordFun.animator();

document.getElementById('word-fun-input').addEventListener('keypress', anim.fire.bind(anim));
document.getElementById('word-fun-fire').addEventListener('click', anim.fire.bind(anim));
document.getElementById('word-fun-input').focus();