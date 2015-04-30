'use strict';

var httpReq = require('http-request');

// The class itself
// Stolen from https://github.com/kkamkou/node-akamai-http-api
var solus = Object.create(null, {
  base_config: {
    writable: false,
    value: {
      apiId: null,
      apiKey: null,
      host: null,
      port: 80,
      ssl: false,
      verbose: false
    }
  },
  config: {
    writable: true,
    value: {}
  }
});

// The string formatter
// Stolen from http://stackoverflow.com/a/4673436
solus.strFormat = function(format) {
  var args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

// Stolen from http://stackoverflow.com/a/1714899
solus.serializeParams = function(obj, prefix) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
};

solus.generateHostUrl = function(params) {
  if (solus.config.host === null) {
    // "Exception" throwing
    // Stolen from http://stackoverflow.com/a/1137209
    throw {
      name:     "ConfigError",
      level:    "FATAL",
      message:  "No 'host' value provided.",
      toString: function(){return this.name + ": " + this.message;}
    }
  };

  var schema = solus.config.ssl ? 'https' : 'http',
      suffix = 'api/admin/command.php',
      host = solus.config.host,
      port = solus.config.port;

  return solus.strFormat('{0}://{1}:{2}/{3}?{4}',
                         schema, host, port, suffix,
                         solus.serializeParams(params));
};

solus.sQuery = function(action, params) {
  // Set Query defaults
  params['rdtype'] = 'json';
  params['id'] = solus.config.apiId;
  params['key'] = solus.config.apiKey;

  // execute response
  httpReq.get(solus.generateHostUrl(params), function (err, res) {
    if (err) {
      console.error(err);
      return 2;
    } else {
      console.log(res);
      return res
    };

    console.log(res.code, res.headers, res.buffer.toString());
  });
}


solus.setConfig = function (conf) {
  conf = typeof conf !== 'undefined' ? conf : {};

  for (var k in this.base_config) {
    this.config[k] = this.base_config[k]
  };
  for (var k in conf) {
    this.config[k] = conf[k]
  };

  return this;
};

