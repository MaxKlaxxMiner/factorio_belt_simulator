(function ()
{
  window.performance = window.performance || {};
  Date.now = (Date.now || function () { return new Date().getTime(); });
  if (!window.performance.now)
  {
    var nowOffset = Date.now();
    if (performance.timing && performance.timing.navigationStart) nowOffset = performance.timing.navigationStart;
    window.performance.now = function() { return Date.now() - nowOffset; }
  }
})();
