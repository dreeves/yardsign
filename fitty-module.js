// Fitty initialization and management module
export function initializeFitty() {
  // Initialize fitty for all lines
  const lines = Array.from({length: 12}, (_, i) => i + 1).map(i => {
    return fitty('.line' + i);
  });

  // Ensure proper sizing
  fitty.fitAll();
  fitty.fitAll(); // Double call intentionally to ensure proper sizing
  requestAnimationFrame(updateScale);
  
  return lines;
}

// Scale the sign to fit the window
export function updateScale() {
  const elem = document.getElementById('cynosure');
  if (!elem) return;
  
  const currentWidth = elem.offsetWidth;
  const currentHeight = elem.offsetHeight;
  
  // Store these dimensions to detect changes
  if (!elem.lastWidth) {
    elem.lastWidth = currentWidth;
    elem.lastHeight = currentHeight;
    // Check again in case dimensions change
    requestAnimationFrame(updateScale);
    return;
  }
  
  if (elem.lastWidth !== currentWidth || elem.lastHeight !== currentHeight) {
    elem.lastWidth = currentWidth;
    elem.lastHeight = currentHeight;
    requestAnimationFrame(updateScale);
    return;
  }
  
  const scaleX = (window.innerWidth * 0.95) / currentWidth;
  const scaleY = (window.innerHeight * 0.95) / currentHeight;
  const scale = Math.min(scaleX, scaleY);
  elem.style.transform = `scale(${scale})`;
}

// Debounce helper
export function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}
