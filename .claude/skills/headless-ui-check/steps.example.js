// Example --run file: click a tab per scenario name, type into a field, return a summary string.
(() => {
  document.getElementById('tab-' + window.__scenario)?.click();
  return document.title;
})()
