// Get references to the popup and backdrop elements
const popup = document.getElementById('popup');
const backdrop = document.getElementById('backdrop');

// Function to show the popup
function showPopup() {
  popup.style.display = 'block';
  backdrop.style.display = 'block';
}

// Function to hide the popup
function hidePopup() {
  popup.style.display = 'none';
  backdrop.style.display = 'none';
}

// Show the popup when the screen is clicked, except when clicking inside the popup
document.addEventListener('click', function(event) {
  if (!popup.contains(event.target) && event.target !== backdrop) {
    showPopup();
  }
});

// Hide the popup if the backdrop is clicked
backdrop.addEventListener('click', hidePopup);


// There must be a way to do this in CSS but LLMs and I are too dumb.
function updateScale() {
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

function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedUpdateScale = debounce(updateScale, 100);

// Ensure everything is loaded before initializing
function initialize() {
  // Wait for both DOM and fonts to be ready
  Promise.all([
    new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    }),
    document.fonts.ready
  ]).then(() => {
    // Initialize fitty for all lines
    fitty('.line1');
    fitty('.line2');
    fitty('.line3');
    fitty('.line4');
    fitty('.line5');
    fitty('.line6');
    fitty('.line7');
    fitty('.line8');
    fitty('.line9');
    fitty('.line10');
    fitty('.line11');
    fitty('.line12');
    
    updateSignFromTextarea();
    fitty.fitAll(); // Recalculate all line sizes
    fitty.fitAll(); // Recalculate all line sizes again to be sure
    requestAnimationFrame(updateScale);
    
    // Set up event listeners
    window.addEventListener('resize', debouncedUpdateScale);
  });
}

// Start initialization
initialize();


// Derived from fitty, with fix for line height:
// https://github.com/rikschennink/fitty/blob/gh-pages/src/fitty.js

w = this;

// node list to array helper method
const toArray = (nl) => [].slice.call(nl);

// states
const DrawState = {
    IDLE: 0,
    DIRTY_CONTENT: 1,
    DIRTY_LAYOUT: 2,
    DIRTY: 3,
};

// all active fitty elements
let fitties = [];

// group all redraw calls till next frame, we cancel each frame request when a new one comes in. If no support for request animation frame, this is an empty function and supports for fitty stops.
let redrawFrame = null;
const requestRedraw =
      'requestAnimationFrame' in w ?
      () => {
          w.cancelAnimationFrame(redrawFrame);
          redrawFrame = w.requestAnimationFrame(() =>
                                                redraw(fitties.filter((f) => f.dirty && f.active))
                                               );
      } :
      () => {};

// sets all fitties to dirty so they are redrawn on the next redraw loop, then calls redraw
const redrawAll = (type) => () => {
    fitties.forEach((f) => (f.dirty = type));
    requestRedraw();
};

// redraws fitties so they nicely fit their parent container
const redraw = (fitties) => {
    // getting info from the DOM at this point should not trigger a reflow, let's gather as much intel as possible before triggering a reflow

    // check if styles of all fitties have been computed
    fitties
        .filter((f) => !f.styleComputed)
        .forEach((f) => {
            f.styleComputed = computeStyle(f);
        });

    // restyle elements that require pre-styling, this triggers a reflow, please try to prevent by adding CSS rules (see docs)
    fitties.filter(shouldPreStyle).forEach(applyStyle);

    // we now determine which fitties should be redrawn
    const fittiesToRedraw = fitties.filter(shouldRedraw);

    // we calculate final styles for these fitties
    fittiesToRedraw.forEach(calculateStyles);

    // now we apply the calculated styles from our previous loop
    fittiesToRedraw.forEach((f) => {
        applyStyle(f);
        markAsClean(f);
    });

    // now we dispatch events for all restyled fitties
    fittiesToRedraw.forEach(dispatchFitEvent);
};

const markAsClean = (f) => (f.dirty = DrawState.IDLE);

const calculateStyles = (f) => {
    // get available width from parent node
    f.availableWidth = f.element.parentNode.clientWidth;

    // the space our target element uses
    f.currentWidth = f.element.scrollWidth;

    // remember current font size
    f.previousFontSize = f.currentFontSize;

    // let's calculate the new font size
    f.currentFontSize = Math.min(
        Math.max(f.minSize, (f.availableWidth / f.currentWidth) * f.previousFontSize),
        f.maxSize
    );

    // if allows wrapping, only wrap when at minimum font size (otherwise would break container)
    f.whiteSpace = f.multiLine && f.currentFontSize === f.minSize ? 'normal' : 'nowrap';
};

// should always redraw if is not dirty layout, if is dirty layout, only redraw if size has changed
const shouldRedraw = (f) =>
      f.dirty !== DrawState.DIRTY_LAYOUT ||
      (f.dirty === DrawState.DIRTY_LAYOUT &&
       f.element.parentNode.clientWidth !== f.availableWidth);

// every fitty element is tested for invalid styles
const computeStyle = (f) => {
    // get style properties
    const style = w.getComputedStyle(f.element, null);

    // get current font size in pixels (if we already calculated it, use the calculated version)
    f.currentFontSize = parseFloat(style.getPropertyValue('font-size'));

    // get display type and wrap mode
    f.display = style.getPropertyValue('display');
    f.whiteSpace = style.getPropertyValue('white-space');
    //        console.log("original line height is " + style.getPropertyValue('line-height'));
    f.lineHeight = "90%";

    // styles computed
    return true;
};

// determines if this fitty requires initial styling, can be prevented by applying correct styles through CSS
const shouldPreStyle = (f) => {
    let preStyle = false;

    // if we already tested for prestyling we don't have to do it again
    if (f.preStyleTestCompleted) return false;

    // should have an inline style, if not, apply
    if (!/inline-/.test(f.display)) {
        preStyle = true;
        f.display = 'inline-block';
    }

    // to correctly calculate dimensions the element should have whiteSpace set to nowrap
    if (f.whiteSpace !== 'nowrap') {
        preStyle = true;
        f.whiteSpace = 'nowrap';
    }

    // we don't have to do this twice
    f.preStyleTestCompleted = true;

    return preStyle;
};

// apply styles to single fitty
const applyStyle = (f) => {
    f.element.style.whiteSpace = f.whiteSpace;
    f.element.style.display = f.display;
    f.element.style.fontSize = f.currentFontSize + 'px';
    f.element.style.lineHeight = f.lineHeight;
    //     console.log("line height is " +  f.lineHeight);
};

// dispatch a fit event on a fitty
const dispatchFitEvent = (f) => {
    f.element.dispatchEvent(
        new CustomEvent('fit', {
            detail: {
                oldValue: f.previousFontSize,
                newValue: f.currentFontSize,
                scaleFactor: f.currentFontSize / f.previousFontSize,
            },
        })
    );
};

// fit method, marks the fitty as dirty and requests a redraw (this will also redraw any other fitty marked as dirty)
const fit = (f, type) => () => {
    f.dirty = type;
    if (!f.active) return;
    requestRedraw();
};

const init = (f) => {
    // save some of the original CSS properties before we change them
    f.originalStyle = {
        whiteSpace: f.element.style.whiteSpace,
        display: f.element.style.display,
        fontSize: f.element.style.fontSize,
    };

    // should we observe DOM mutations
    observeMutations(f);

    // this is a new fitty so we need to validate if it's styles are in order
    f.newbie = true;

    // because it's a new fitty it should also be dirty, we want it to redraw on the first loop
    f.dirty = true;

    // we want to be able to update this fitty
    fitties.push(f);
};

const destroy = (f) => () => {
    // remove from fitties array
    fitties = fitties.filter((_) => _.element !== f.element);

    // stop observing DOM
    if (f.observeMutations) f.observer.disconnect();

    // reset the CSS properties we changes
    f.element.style.whiteSpace = f.originalStyle.whiteSpace;
    f.element.style.display = f.originalStyle.display;
    f.element.style.fontSize = f.originalStyle.fontSize;
};

// add a new fitty, does not redraw said fitty
const subscribe = (f) => () => {
    if (f.active) return;
    f.active = true;
    requestRedraw();
};

// remove an existing fitty
const unsubscribe = (f) => () => (f.active = false);

const observeMutations = (f) => {
    // no observing?
    if (!f.observeMutations) return;

    // start observing mutations
    f.observer = new MutationObserver(fit(f, DrawState.DIRTY_CONTENT));

    // start observing
    f.observer.observe(f.element, f.observeMutations);
};

// default mutation observer settings
const mutationObserverDefaultSetting = {
    subtree: true,
    childList: true,
    characterData: true,
};

// default fitty options
const defaultOptions = {
    minSize: 16,
    maxSize: 512,
    multiLine: true,
    observeMutations: 'MutationObserver' in w ? mutationObserverDefaultSetting : false,
};

// array of elements in, fitty instances out
function fittyCreate(elements, options) {
    // set options object
    const fittyOptions = Object.assign({},
                                       // expand default options
                                       defaultOptions,
                                       // override with custom options
                                       options
                                      );

    // create fitties
    const publicFitties = elements.map((element) => {
        // create fitty instance
        const f = Object.assign({}, fittyOptions, {
            // internal options for this fitty
            element,
            active: true,
        });

        // initialise this fitty
        init(f);

        // expose API
        return {
            element,
            fit: fit(f, DrawState.DIRTY),
            unfreeze: subscribe(f),
            freeze: unsubscribe(f),
            unsubscribe: destroy(f),
        };
    });

    // call redraw on newly initiated fitties
    requestRedraw();

    // expose fitties
    return publicFitties;
}

// fitty creation function
function fitty(target, options = {}) {
    // if target is a string
    return typeof target === 'string' ? // treat it as a querySelector
    fittyCreate(toArray(document.querySelectorAll(target)), options) : // create single fitty
    fittyCreate([target], options)[0];
}

// handles viewport changes, redraws all fitties, but only does so after a timeout
let resizeDebounce = null;
const onWindowResized = () => {
    w.clearTimeout(resizeDebounce);
    resizeDebounce = w.setTimeout(redrawAll(DrawState.DIRTY_LAYOUT), fitty.observeWindowDelay);
};

// define observe window property, so when we set it to true or false events are automatically added and removed
const events = ['resize', 'orientationchange'];
Object.defineProperty(fitty, 'observeWindow', {
    set: (enabled) => {
        const method = `${enabled ? 'add' : 'remove'}EventListener`;
        events.forEach((e) => {
            w[method](e, onWindowResized);
        });
    },
});

// fitty global properties (by setting observeWindow to true the events above get added)
fitty.observeWindow = true;
fitty.observeWindowDelay = 100;

// public fit all method, will force redraw no matter what
fitty.fitAll = redrawAll(DrawState.DIRTY);



// Load initial content from URL if present
const params = new URLSearchParams(window.location.search);
if (params.has('signcopy')) {
  document.getElementById('signText').value = params.get('signcopy');
}

// Core function to update sign display from text
function updateSign(signText) {
  const lines = signText.split('\n');

  // Update each line of the sign
  for (let i = 1; i <= 12; i++) {
    const line = document.querySelector('.line' + i);
    if (line) {
      line.innerHTML = lines[i-1] || ''; // Clear line if no content
    }
  }
  // Explicitly refit each line
  for (let i = 1; i <= 12; i++) {
    fitty('.line' + i);
  }
  fitty.fitAll(); // Recalculate all line sizes
  fitty.fitAll(); // Recalculate all line sizes
  requestAnimationFrame(updateScale);
}



// Function to update sign and URL from textarea
function updateSignFromTextarea() {
  const textarea = document.getElementById('signText');
  
  // Core update wrapped in animation frame
  requestAnimationFrame(() => {
    updateSign(textarea.value);
    fitty.fitAll(); // Ensure all lines are fitted
    requestAnimationFrame(updateScale);
  });
  
  // update search params
  if (history.pushState) {
    let searchParams = new URLSearchParams();
    searchParams.set('signcopy', textarea.value);
    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
    window.history.pushState({path: newurl}, '', newurl);
  }
}

// Add event listener for textarea changes
document.getElementById('signText').addEventListener('input', updateSignFromTextarea);

function copyToClipboard() {
    div = document.getElementById("sign");
    html2canvas(div, {
        onrendered: function(canvas) {
            canvas.toBlob(function(blob) {
                const item = new ClipboardItem({
                    "image/png": blob
                });
                navigator.clipboard.write([item]).then(
                    function() {
                        alert("copied png to clipboard");
                    },
                    function(err) {
                        alert("error copying to clipboard: " + err);
                    }
                );
            });
        }
    });
}
