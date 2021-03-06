// Generated by CoffeeScript 1.4.0

/*
          >>>
          >>>                        >>>                         >>>
     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
    .....................x.......xx.x.................................
*/


(function() {
  var CoffeeScript, doctest, fetch, q, rewrite, _,
    __slice = [].slice;

  doctest = function() {
    var urls;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _.each(urls, fetch);
  };

  if (typeof window !== 'undefined') {
    _ = window._, CoffeeScript = window.CoffeeScript;
    window.doctest = doctest;
  } else {
    _ = require('underscore');
    CoffeeScript = require('coffee-script');
    module.exports = doctest;
  }

  doctest.version = '0.4.1';

  doctest.queue = [];

  doctest.input = function(fn) {
    return this.queue.push(fn);
  };

  doctest.output = function(num, fn) {
    fn.line = num;
    return this.queue.push(fn);
  };

  doctest.run = function() {
    var actual, expected, fn, input, num, results;
    results = [];
    input = null;
    while (fn = this.queue.shift()) {
      if (!(num = fn.line)) {
        if (typeof input === "function") {
          input();
        }
        input = fn;
        continue;
      }
      actual = (function() {
        try {
          return input();
        } catch (error) {
          return error.constructor;
        }
      })();
      expected = fn();
      results.push([_.isEqual(actual, expected), q(expected), q(actual), num]);
      input = null;
    }
    return this.complete(results);
  };

  doctest.complete = function(results) {
    var actual, expected, num, pass, r, _i, _len, _ref, _ref1, _results;
    console.log(((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        pass = results[_i][0];
        _results.push(pass ? '.' : 'x');
      }
      return _results;
    })()).join(''));
    _ref = (function() {
      var _j, _len, _results1;
      _results1 = [];
      for (_j = 0, _len = results.length; _j < _len; _j++) {
        r = results[_j];
        if (!r[0]) {
          _results1.push(r);
        }
      }
      return _results1;
    })();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], pass = _ref1[0], expected = _ref1[1], actual = _ref1[2], num = _ref1[3];
      _results.push(console.warn("expected " + expected + " on line " + num + " (got " + actual + ")"));
    }
    return _results;
  };

  fetch = function(path) {
    var fs, script;
    console.log("retrieving " + path + "...");
    if (typeof window !== 'undefined') {
      if (path[0] === '.' && (script = jQuery('script[src$="doctest.js"]')).length) {
        path = script.attr('src').replace(/doctest[.]js$/, path);
      }
      return jQuery.ajax(path, {
        dataType: 'text',
        success: function(text) {
          var name, source, type, _ref;
          _ref = /[^/]+[.](coffee|js)$/.exec(path), name = _ref[0], type = _ref[1];
          console.log("running doctests in " + name + "...");
          source = rewrite(text, type);
          if (type === 'coffee') {
            source = CoffeeScript.compile(source);
          }
          Function(source)();
          return doctest.run();
        }
      });
    } else {
      fs = require('fs');
      return fs.readFile(path, 'utf8', function(err, text) {
        var file, name, source, type, _ref;
        _ref = /[^/]+[.](coffee|js)$/.exec(path), name = _ref[0], type = _ref[1];
        console.log("running doctests in " + name + "...");
        source = rewrite(text, type);
        if (type === 'coffee') {
          source = CoffeeScript.compile(source);
        }
        name += "-" + (+(new Date));
        file = "" + __dirname + "/" + name + ".js";
        fs.writeFileSync(file, source, 'utf8');
        require("./" + name);
        fs.unlink(file);
        return doctest.run();
      });
    }
  };

  rewrite = function(text, type) {
    var comment, comments, expr, f, idx, indent, line, lines, match, _i, _len, _ref, _ref1;
    f = function(expr) {
      switch (type) {
        case 'coffee':
          return "->\n" + indent + "  " + expr + "\n" + indent;
        case 'js':
          return "function() {\n" + indent + "  return " + expr + "\n" + indent + "}";
      }
    };
    comments = {
      coffee: /^([ \t]*)#[ \t]*(.+)/,
      js: /^([ \t]*)\/\/[ \t]*(.+)/
    };
    lines = [];
    expr = '';
    if (typeof window === 'undefined') {
      lines.push((function() {
        switch (type) {
          case 'coffee':
            return 'doctest = require "./doctest"';
          case 'js':
            return 'var doctest = require("./doctest");';
        }
      })());
    }
    _ref = text.split(/\r?\n|\r/);
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      line = _ref[idx];
      if (match = comments[type].exec(line)) {
        _ref1 = match, match = _ref1[0], indent = _ref1[1], comment = _ref1[2];
        if (match = /^>(.*)/.exec(comment)) {
          if (expr) {
            lines.push("" + indent + "doctest.input(" + (f(expr)) + ");");
          }
          expr = match[1];
        } else if (match = /^[.]+(.*)/.exec(comment)) {
          expr += "\n" + indent + "  " + match[1];
        } else if (expr) {
          lines.push("" + indent + "doctest.input(" + (f(expr)) + ");");
          lines.push("" + indent + "doctest.output(" + (idx + 1) + ", " + (f(comment)) + ");");
          expr = '';
        }
      } else {
        lines.push(line);
      }
    }
    return lines.join('\n');
  };

  q = function(object) {
    switch (typeof object) {
      case 'string':
        return "\"" + object + "\"";
      case 'function':
        try {
          throw object();
        } catch (error) {
          if (error instanceof Error) {
            return object.name;
          }
        }
    }
    return object;
  };

}).call(this);
