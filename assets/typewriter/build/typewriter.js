// Generated by CoffeeScript 1.6.3
(function() {
  var PrioritySequence, Typewriter, assert, charactergenerator, random;

  assert = require('assert');

  PrioritySequence = require('./prioritysequence');

  random = require('./random');

  charactergenerator = require('./charactergenerator');

  Typewriter = (function() {
    function Typewriter() {
      var _this = this;
      this._prioritySequence = new PrioritySequence(function() {
        return _this._sequenceLevel = 0;
      });
    }

    Typewriter.prototype.setTargetDomElement = function(targetDomElement) {
      assert.ok(targetDomElement instanceof Element, 'TargetDomElement must be an instance of Element');
      return this.targetDomElement = targetDomElement;
    };

    Typewriter.prototype.setAccuracy = function(accuracy) {
      assert.strictEqual(typeof accuracy, 'number', 'Accuracy must be a number');
      assert.ok(accuracy > 0 && accuracy <= 100, 'Accuracy must be greater than 0 and less than or equal to 100');
      return this.accuracy = accuracy;
    };

    Typewriter.prototype.setMinimumSpeed = function(minimumSpeed) {
      assert.strictEqual(typeof minimumSpeed, 'number', 'MinimumSpeed must be a number');
      assert.ok(minimumSpeed > 0, 'MinimumSpeed must be greater than 0');
      if ((this.maximumSpeed != null) && minimumSpeed > this.maximumSpeed) {
        return this.minimumSpeed = this.maximumSpeed;
      } else {
        return this.minimumSpeed = minimumSpeed;
      }
    };

    Typewriter.prototype.setMaximumSpeed = function(maximumSpeed) {
      assert.strictEqual(typeof maximumSpeed, 'number', 'MaximumSpeed must be a number');
      assert.ok(maximumSpeed > 0, 'MaximumSpeed must be greater than 0');
      if ((this.minimumSpeed != null) && this.minimumSpeed > maximumSpeed) {
        return this.maximumSpeed = minimumSpeed;
      } else {
        return this.maximumSpeed = maximumSpeed;
      }
    };

    Typewriter.prototype.setKeyboardLayout = function(keyboardLayout) {
      assert.strictEqual(typeof keyboardLayout.getAdjacentCharacter, 'function', 'KeyboardLayout must have an exported getAdjacentCharacter method');
      return this.keyboardLayout = keyboardLayout;
    };

    Typewriter.prototype._makeChainable = function(cb, fn) {
      var shadow;
      shadow = Object.create(this);
      shadow._sequenceLevel = this._sequenceLevel;
      this._prioritySequence.then(this._sequenceLevel, function(next) {
        return process.nextTick(function() {
          return fn(function() {
            if (cb != null) {
              cb.call(shadow);
            }
            return next();
          });
        });
      });
      if (cb != null) {
        this._sequenceLevel++;
      }
      if ((cb == null) || this.hasOwnProperty('_prioritySequence')) {
        return this;
      }
    };

    Typewriter.prototype.clear = function(cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        var child;
        while ((child = _this.targetDomElement.lastChild) != null) {
          _this.targetDomElement.removeChild(child);
        }
        return done();
      });
    };

    Typewriter.prototype.waitRange = function(millisMin, millisMax, cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        return setTimeout(done, random.integerInRange(millisMin, millisMax));
      });
    };

    Typewriter.prototype.wait = function(millis, cb) {
      return this.waitRange(millis, millis, cb);
    };

    Typewriter.prototype.put = function(text, cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        var child, element;
        element = document.createElement('div');
        element.innerHTML = text;
        while ((child = element.firstChild) != null) {
          _this.targetDomElement.appendChild(child);
        }
        return done();
      });
    };

    Typewriter.prototype["delete"] = function(cb) {
      var _this = this;
      return this._makeChainable(cb, function(done) {
        _this.targetDomElement.removeChild(_this.targetDomElement.lastChild);
        return done();
      });
    };

    Typewriter.prototype.type = function(text, cb) {
      var char, checkInterval, gen;
      checkInterval = (this.minimumSpeed + this.maximumSpeed) / 2;
      gen = charactergenerator(this.keyboardLayout, this.accuracy, checkInterval, text);
      while ((char = gen.next()) !== null) {
        if (char !== '\b') {
          this.put(char);
        } else {
          this["delete"]();
        }
        this.waitRange(~~(1000 / this.maximumSpeed), ~~(1000 / this.minimumSpeed));
      }
      return this.wait(0, cb);
    };

    return Typewriter;

  })();

  module.exports = Typewriter;

}).call(this);
