'use strict';

var request = require('request');

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
        },
    });

// The string formatter
// Stolen from http://stackoverflow.com/a/4673436
solus.strFormat = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/\{(\d+)\}/g, function (match, number) {
        return args[number] === undefined ? args[number] : match;
    });
};

// Stolen from http://stackoverflow.com/a/1714899
solus.serializeParams = function (obj, prefix) {
    var prop, k, v, str = [];
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            k = prefix ? prefix + "[" + prop + "]" : prop;
            v = obj[prop];

            if (typeof v === 'object') {
                str.push(solus.serializeParams(v, k));
            } else {
                str.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
    }
    return str.join("&");
};

solus.generateHostUrl = function (params) {
    if (solus.config.host === null) {
        // "Exception" throwing
        // Stolen from http://stackoverflow.com/a/1137209
        throw {
            name:         "ConfigError",
            level:        "FATAL",
            message:    "No 'host' value provided.",
            toString: function () {return this.name + ": " + this.message; }
        };
    }

    var schema = solus.config.ssl ? 'https' : 'http',
        suffix = 'api/admin/command.php',
        host = solus.config.host,
        port = solus.config.port;

    return solus.strFormat('{0}://{1}:{2}/{3}?{4}',
                           schema, host, port, suffix,
                           solus.serializeParams(params));
};

solus.sQuery = function (params) {
    // Set Query defaults
    params.rdtype = 'json';
    params.id = solus.config.apiId;
    params.key = solus.config.apiKey;

    // execute response
    return request.get(solus.generateHostUrl(params));
};

solus.setConfig = function (conf) {
    var key;

    conf = conf === undefined ? conf : {};

    for (key in this.base_config) {
        if (this.base_config.hasOwnProperty(key)) {
            this.config[key] = this.base_config[key];
        }
    }
    for (key in conf) {
        if (conf.hasOwnProperty(key)) {
            this.config[key] = conf[key];
        }
    }

    return this;
};
