var ModeManager;
if (typeof require !== "undefined") {
  ModeManager = require("../modemanager.js");
} else {
  ModeManager = window.ModeManager;
}

var ok = function(a, msg) { if (!a) throw new Error(msg || "not ok"); };

describe('modemanager', function() {
  describe('#add', function() {
    it('should add mode objects by name', function() {
      var m = new ModeManager();
      var obj = {};
      m.add('test', obj);
      ok(obj === m.modes.test);
    });

    it('should setup the default mode if isDefault is passed', function() {
      var m = new ModeManager();
      var obj = {};
      m.add('test', obj, true);
      ok(m.defaultMode === 'test');
    });

    it('should not setup the default mode if isDefault is passed', function() {
      var m = new ModeManager();
      var obj = {};
      m.add('test', obj);
      ok(m.defaultMode === null);
    });

    it('should chain', function() {
      var m = new ModeManager();
      ok(m.add('a', {}) === m);
    });
  });

  describe('#handle', function() {
    it('should call the current mode handler if available', function(t) {
      var m =(new ModeManager).add('test', {
        handle: function(type, event) {
          ok(type === 'blah');
          ok(event.abc);

          ok(event.modeManager === m);
          t();
        }
      });

      m.mode('test');
      m.handle('blah', { abc : true });
    });

    it('should call the default mode if the current mode does not handle it', function(t) {
      var m =(new ModeManager()).add('test', { handle : function() {} }).add('default', {
        handle: function(type, event) {
          ok(type === 'event type');

          t();
        }
      }, true);

      m.mode('test');
      m.handle('event type', {});
    });

    it('should call the default mode if the current mode does not handle it (invalid mode)', function(t) {
      var m =(new ModeManager()).add('test').add('default', {
        handle: function(type, event) {
          ok(type === 'event type');

          t();
        }
      }, true);

      m.mode('test');
      m.handle('event type', {});
    });

    it('should return true when the current mode returns true', function() {
      var m =(new ModeManager()).add('test', {
        handle: function(type, event) {
          return type;
        }
      }, true);

      m.mode('test');

      ok(m.handle(true, {}));
      ok(!m.handle(false, {}));
    });

    it('should return true when the default mode returns true', function() {
      var m =(new ModeManager()).add('test', {
        handle: function(type, event) {
          return type;
        }
      }, true);

      ok(m.handle(true, {}));
      ok(!m.handle(false, {}));
    });

  });

  describe('#mode', function() {
    it('should return the current mode if one is set', function() {
      var m =(new ModeManager()).add('test', 'hi');
      ok(m.mode('test') === 'test');
      ok(m.mode() === 'test');
    });

    it('should call mode.activate if available', function() {
      var out = '';
      var m =(new ModeManager()).add('test', {
        activate: function() {
          out += 'a';
        },
        deactivate : function() {
          out += 'd';
        }
      }).add('abc', true);

      ok(m.mode('test'));
      ok(m.mode('abc'));
      ok(out === 'ad');
    });
  });

  describe('#exit', function() {
    it('should exit the current mode and return to default', function() {
      var out = '';
      var m =(new ModeManager()).add('test', {
        deactivate : function() {
          out += 'd';
        }
      }).add('abc', true, true);

      m.mode('test');
      ok(m.exit() === m);
      ok(out === 'd');
      ok(m.mode() === 'abc');
    });
  });

  describe('#update', function() {
    it('should chain', function() {
      var m = new ModeManager();
      ok(m === m.update())
    });

    it('should call the current mode.update if available', function(t) {
      var m = new ModeManager();

      m.add('test', {
        update : function(d) {
          ok(d === 1);
          t();
        }
      })
      
      m.mode('test');

      m.update(1);
    });

    it('should call the default when the mode is not set', function(t) {
      var m = new ModeManager();

      m.add('test', {})

      m.add('default', {
        update : function(d) {
          ok(d === 1);
          t();
        }
      }, true)

      m.mode('test');

      m.update(1);
    });
  });

  describe('composition', function() {
    it('should stack as expected', function(t) {
      var root = new ModeManager();
      var m = new ModeManager();

      root.add('m', m);

      m.add('default', {
        handle: function(type) {
          ok(type === 'test');
          t();
        }
      }, true);

      root.mode('m');
      root.handle('test');
    });
  });
});
