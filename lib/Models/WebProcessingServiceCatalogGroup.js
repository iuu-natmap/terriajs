'use strict';

/*global require*/
var URI = require('urijs');

var CatalogGroup = require('./CatalogGroup');
var clone = require('terriajs-cesium/Source/Core/clone');
var defined = require('terriajs-cesium/Source/Core/defined');
var defineProperties = require('terriajs-cesium/Source/Core/defineProperties');
var freezeObject = require('terriajs-cesium/Source/Core/freezeObject');
var inherit = require('../Core/inherit');
var knockout = require('terriajs-cesium/Source/ThirdParty/knockout');
var loadXML = require('terriajs-cesium/Source/Core/loadXML');
var proxyCatalogItemUrl = require('./proxyCatalogItemUrl');
var WebProcessingServiceCatalogFunction = require('./WebProcessingServiceCatalogFunction');
var xml2json = require('../ThirdParty/xml2json');

/**
 * A catalog group that is populated by querying available processes from a Web Processing Service (WPS)
 * server.
 *
 * @alias WebProcessingServiceCatalogGroup
 * @constructor
 * @extends CatalogGroup
 *
 * @param {Terria} terria The Terria instance.
 */
function WebProcessingServiceCatalogGroup(terria) {
    CatalogGroup.call(this, terria);

    /**
     * Gets or sets the URL of the WPS server.  This property is observable.
     * @type {String}
     */
    this.url = '';

    /**
     * Gets or sets a hash of properties that will be set on each child item.
     * For example, { "treat404AsError": false }
     * @type {Object}
     */
    this.itemProperties = undefined;

    knockout.track(this, ['url', 'itemPropertes']);
}

inherit(CatalogGroup, WebProcessingServiceCatalogGroup);

defineProperties(WebProcessingServiceCatalogGroup.prototype, {
    /**
     * Gets the type of data member represented by this instance.
     * @memberOf WebProcessingServiceCatalogGroup.prototype
     * @type {String}
     */
    type : {
        get : function() {
            return 'wps-getCapabilities';
        }
    },

    /**
     * Gets a human-readable name for this type of data source, such as 'Web Processing Service (WPS)'.
     * @memberOf WebProcessingServiceCatalogGroup.prototype
     * @type {String}
     */
    typeName : {
        get : function() {
            return 'Web Processing Service (WPS) Server';
        }
    },

    /**
     * Gets the set of functions used to serialize individual properties in {@link CatalogMember#serializeToJson}.
     * When a property name on the model matches the name of a property in the serializers object lieral,
     * the value will be called as a function and passed a reference to the model, a reference to the destination
     * JSON object literal, and the name of the property.
     * @memberOf WebProcessingServiceCatalogGroup.prototype
     * @type {Object}
     */
    serializers : {
        get : function() {
            return WebProcessingServiceCatalogGroup.defaultSerializers;
        }
    }
});

/**
 * Gets or sets the set of default serializer functions to use in {@link CatalogMember#serializeToJson}.  Types derived from this type
 * should expose this instance - cloned and modified if necesary - through their {@link CatalogMember#serializers} property.
 * @type {Object}
 */
WebProcessingServiceCatalogGroup.defaultSerializers = clone(CatalogGroup.defaultSerializers);
WebProcessingServiceCatalogGroup.defaultSerializers.items = function(wpsGroup, json, propertyName, options) {};
WebProcessingServiceCatalogGroup.defaultSerializers.isLoading = function(wpsGroup, json, propertyName, options) {};
freezeObject(WebProcessingServiceCatalogGroup.defaultSerializers);

WebProcessingServiceCatalogGroup.prototype._getValuesThatInfluenceLoad = function() {
    return [this.url, this.itemProperties];
};

WebProcessingServiceCatalogGroup.prototype._load = function() {
    var uri = new URI(this.url).search({
        service: 'WPS',
        request: 'GetCapabilities',
        version: '1.0.0'
    });

    var url = proxyCatalogItemUrl(this, uri.toString(), '1d');

    var that = this;
    return loadXML(url).then(function(xml) {
        var json = xml2json(xml);

        var processOfferings = json.ProcessOfferings;
        if (!defined(processOfferings)) {
            return;
        }

        var processes = processOfferings.Process;
        if (!defined(processes)) {
            return;
        }

        if (!Array.isArray(processes)) {
            processes = [processes];
        }

        for (var i = 0; i < processes.length; ++i) {
            var process = processes[i];

            var catalogFunction = new WebProcessingServiceCatalogFunction(that.terria);
            catalogFunction.url = that.url;
            catalogFunction.name = process.Title;
            catalogFunction.identifier = process.Identifier;

            if (defined(process.Abstract)) {
                catalogFunction.description = process.Abstract;
            }

            that.items.push(catalogFunction);
        }

        // finally add an event listener that cleans up when the window is unloaded
        window.addEventListener('unload', that.cleanUp(true)); 

        // add an onbeforeunload alert (if one doesn't already exist)
        if (!defined(window.onbeforeunload)) {
            window.onbeforeunload = function() {
                return 'If you leave or reload this page, you may lose any analysis results you have displayed!';
            };
        }
    });
};

/**
 * Clean up the group. This is a WPS call but not all WPS will support it.... so we call it and ignore the result.
 */
WebProcessingServiceCatalogGroup.prototype.cleanUp = function(synchronous) {
    var doAsync = synchronous === false;
    var cleanUrl = cleanAndProxyUrl(this.terria, this.url) + '?&version=1.0.0&request=Execute&service=WPS&Identifier=clean&status=true&storeExecuteResponse=true';
    console.log("Cleaning "+cleanUrl);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", cleanUrl, doAsync);  
    // don't care what happens here
    xhr.send();
};

function cleanAndProxyUrl(terria, url) {
    // Strip off the search portion of the URL
    var uri = new URI(url);
    uri.search('');

    var cleanedUrl = uri.toString();
    if (defined(terria.corsProxy) && terria.corsProxy.shouldUseProxy(cleanedUrl)) {
        cleanedUrl = terria.corsProxy.getURL(cleanedUrl, '1d');
    }

    return cleanedUrl;
}
module.exports = WebProcessingServiceCatalogGroup;
