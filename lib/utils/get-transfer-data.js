'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _types = require('../constants/types');

var _types2 = _interopRequireDefault(_types);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Fragment matching regexp for HTML nodes.
 *
 * @type {RegExp}
 */

var FRAGMENT_MATCHER = / data-slate-fragment="([^\s]+)"/;

/**
 * Get the data and type from a native data `transfer`.
 *
 * @param {DataTransfer} transfer
 * @return {Object}
 */

function getTransferData(transfer) {
  var fragment = getType(transfer, _types2.default.FRAGMENT);
  var node = getType(transfer, _types2.default.NODE);
  var html = getType(transfer, 'text/html');
  var rich = getType(transfer, 'text/rtf');
  var text = getType(transfer, 'text/plain');
  var files = void 0;

  // If there isn't a fragment, but there is HTML, check to see if the HTML is
  // actually an encoded fragment.
  if (!fragment && html && ~html.indexOf(' data-slate-fragment="')) {
    var matches = FRAGMENT_MATCHER.exec(html);

    var _matches = _slicedToArray(matches, 2),
        full = _matches[0],
        encoded = _matches[1]; // eslint-disable-line no-unused-vars


    if (encoded) fragment = encoded;
  }

  // Decode a fragment or node if they exist.
  if (fragment) fragment = _base2.default.deserializeNode(fragment);
  if (node) node = _base2.default.deserializeNode(node);

  // Get and normalize files if they exist.
  if (transfer.items && transfer.items.length) {
    files = Array.from(transfer.items).map(function (item) {
      return item.kind == 'file' ? item.getAsFile() : null;
    }).filter(function (exists) {
      return exists;
    });
  } else if (transfer.files && transfer.files.length) {
    files = Array.from(transfer.files);
  }

  // Determine the type of the data.
  var data = { files: files, fragment: fragment, html: html, node: node, rich: rich, text: text };
  data.type = getTransferType(data);
  return data;
}

/**
 * Get the type of a transfer from its `data`.
 *
 * @param {Object} data
 * @return {String}
 */

function getTransferType(data) {
  if (data.fragment) return 'fragment';
  if (data.node) return 'node';

  // COMPAT: Microsoft Word adds an image of the selected text to the data.
  // Since files are preferred over HTML or text, this would cause the type to
  // be considered `files`. But it also adds rich text data so we can check
  // for that and properly set the type to `html` or `text`. (2016/11/21)
  if (data.rich && data.html) return 'html';
  if (data.rich && data.text) return 'text';

  if (data.files && data.files.length) return 'files';
  if (data.html) return 'html';
  if (data.text) return 'text';
  return 'unknown';
}

/**
 * Get one of types `TYPES.FRAGMENT`, `TYPES.NODE`, `text/html`, `text/rtf` or
 * `text/plain` from transfers's `data` if possible, otherwise return null.
 *
 * @param {Object} transfer
 * @param {String} type
 * @return {String}
 */

function getType(transfer, type) {
  if (!transfer.types || !transfer.types.length) {
    // COMPAT: In IE 11, there is no `types` field but `getData('Text')`
    // is supported`. (2017/06/23)
    return type === 'text/plain' ? transfer.getData('Text') || null : null;
  }
  // COMPAT: In EDGE, `transfer.types` doesn't support `indexOf` but `contains`
  // is supported`. (2017/08/14)
  return (_environment.IS_EDGE ? transfer.types.contains(type) : transfer.types.indexOf(type) !== -1) ? transfer.getData(type) || null : null;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getTransferData;