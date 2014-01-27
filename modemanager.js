function ModeManager(debug) {
  this.modes = {};
  this._mode = null;
  this.defaultMode = null;
  this.debug = !!debug;
}

ModeManager.prototype.mode = function(mode, options) {
  if (mode) {
    if (this.modes[mode]) {
      if (this._mode && typeof this.modes[this._mode].deactivate === 'function') {
        this.modes[this._mode].deactivate(mode);
      }

      var old = this._mode;
      this._mode = mode;

      if (typeof this.modes[mode].activate === 'function') {
        this.modes[mode].activate(old, options);
      }

      this.debug && console.log(old, '->', mode);
    } else {
      this.debug && console.log('mode not registered:', mode);
    }
  }

  return this._mode;
};

ModeManager.prototype.add = function(name, obj, isDefault) {
  this.modes[name] = obj;
  if (isDefault) {
    this.defaultMode = name;
  }
  return this;
}

ModeManager.prototype.handle = function(type, event) {
  if (event) {
    event.modeManager = this;
  }
  var mode = this._mode;
  var defaultMode = this.defaultMode;

  if (!this.modes[mode] ||
      !this.modes[mode].handle ||
      !this.modes[mode].handle(type, event)
     )
  {
    if (defaultMode &&
        this.modes[defaultMode] &&
        this.modes[defaultMode].handle
       )
    {
      return this.modes[this.defaultMode].handle(type, event);
    }
  } else {
    return true;
  }
}

ModeManager.prototype.update = function(delta) {

  if (this.modes[this._mode] && typeof this.modes[this._mode].update === 'function') {
    this.modes[this._mode].update(delta);
  }

  if (this.modes[this.defaultMode] && typeof this.modes[this.defaultMode].update === 'function') {
    this.modes[this.defaultMode].update(delta);
  }

  return this;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModeManager;
} else {
  window.ModeManager = ModeManager;
}
