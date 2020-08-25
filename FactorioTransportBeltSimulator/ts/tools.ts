/* tslint:disable:one-line max-line-length interface-name comment-format no-bitwise */

const requestAnimFrame = (() => (window.requestAnimationFrame || (<any>window).webkitRequestAnimationFrame || (<any>window).mozRequestAnimationFrame || ((cb: TimerHandler) => window.setTimeout(cb, 1000 / 60))))();

interface DocumentSize
{
  width: number;
  height: number;
}

function getDocumentSize(): DocumentSize
{
  const body = document.body;
  const html = document.documentElement;
  return {
    width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
    height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
  };
}

const Easing = {
  /** no easing, no acceleration */
  linear: (t: number) => t,
  /** accelerating from zero velocity */
  easeInQuad: (t: number) => t * t,
  /** decelerating to zero velocity */
  easeOutQuad: (t: number) => t * (2 - t),
  /** acceleration until halfway, then deceleration */
  easeInOutQuad: (t: number) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  /** accelerating from zero velocity  */
  easeInCubic: (t: number) => t * t * t,
  /** decelerating to zero velocity  */
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  /** acceleration until halfway, then deceleration  */
  easeInOutCubic: (t: number) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  /** accelerating from zero velocity  */
  easeInQuart: (t: number) => t * t * t * t,
  /** decelerating to zero velocity  */
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  /** acceleration until halfway, then deceleration */
  easeInOutQuart: (t: number) => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  /** accelerating from zero velocity */
  easeInQuint: (t: number) => t * t * t * t * t,
  /** decelerating to zero velocity */
  easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
  /** acceleration until halfway, then deceleration  */
  easeInOutQuint: (t: number) => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
};
