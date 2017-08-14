'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactDom = require('react-dom');

/**
 * Get clipboard HTML data by capturing the HTML inserted by the browser's
 * native paste action. To make this work, `preventDefault()` may not be
 * called on the `onPaste` event. As this method is asynchronous, a callback
 * is needed to return the HTML content. This solution was adapted from
 * http://stackoverflow.com/a/6804718.
 *
 * @param {React.Component} component
 * @param {Function} callback
 */

function getHtmlFromNativePaste(component, callback) {
  var el = (0, _reactDom.findDOMNode)(component);

  var savedContent = document.createDocumentFragment();

  while (el.childNodes.length > 0) {
    savedContent.appendChild(el.childNodes[0]);
  }

  setTimeout(function () {
    if (el.childElementCount > 0) {
      var html = el.innerHTML;

      el.innerHTML = '';
      el.appendChild(savedContent);

      callback(html);
    } else {
      // Only plain text, no HTML.
      callback();
    }
  }, 0);

  // -- old solution start
  // // Clone contentedible element, move out of screen and set focus.
  // const clone = el.cloneNode()
  // clone.setAttribute('class', '')
  // clone.setAttribute('style', 'position: fixed; left: -9999px')
  // el.parentNode.insertBefore(clone, el)
  // clone.focus()

  // // Clear call stack to let native paste behaviour occur on cloned element,
  // // then get what was pasted from the DOM and remove cloned element.
  // setTimeout(() => {
  //   if (clone.childElementCount > 0) {
  //     // If the node contains any child nodes, that is the HTML content.
  //     const html = clone.innerHTML
  //     clone.parentNode.removeChild(clone)

  //     callback(html)
  //   } else {
  //     // Only plain text, no HTML.
  //     callback()
  //   }
  // }, 0)
  // -- old solution end
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getHtmlFromNativePaste;