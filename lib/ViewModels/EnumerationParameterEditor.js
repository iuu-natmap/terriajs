'use strict';

/*global require*/
var defineProperties = require('terriajs-cesium/Source/Core/defineProperties');
var knockout = require('terriajs-cesium/Source/ThirdParty/knockout');
var loadView = require('../Core/loadView');

var EnumerationParameterEditor = function(catalogFunction, parameter, parameterValues) {
    this.catalogFunction = catalogFunction;
    this.parameter = parameter;

    knockout.defineProperty(this, 'value', {
        get: function() {
            return parameterValues[parameter.id];
        },
        set: function(value) {
            parameterValues[parameter.id] = value;
        }
    });
};

defineProperties(EnumerationParameterEditor.prototype, {
    elementID: {
        get: function() {
            return 'parameter-editor-enumeration' + encodeURIComponent(this.parameter.id);
        }
    }
});

EnumerationParameterEditor.prototype.show = function(container) {
    loadView(require('fs').readFileSync(__dirname + '/../Views/EnumerationParameterEditor.html', 'utf8'), container, this);
};

module.exports = EnumerationParameterEditor;