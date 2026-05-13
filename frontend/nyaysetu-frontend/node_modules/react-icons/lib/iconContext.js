"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IconContext = exports.DefaultContext = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var DefaultContext = exports.DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = exports.IconContext = _react.default.createContext && /*#__PURE__*/_react.default.createContext(DefaultContext);