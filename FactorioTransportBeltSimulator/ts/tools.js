/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */
var requestAnimFrame = (function () { return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || (function (cb) { return window.setTimeout(cb, 1000 / 60); })); })();
function getDocumentSize() {
    var body = document.body;
    var html = document.documentElement;
    return {
        width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
        height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    };
}
//# sourceMappingURL=tools.js.map