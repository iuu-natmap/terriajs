'use strict';

/*global require*/
var ArcGisMapServerCatalogItem = require('../Models/ArcGisMapServerCatalogItem');
var BaseMapViewModel = require('./BaseMapViewModel');
var CompositeCatalogItem = require('../Models/CompositeCatalogItem');
var WebMapServiceCatalogItem = require('../Models/WebMapServiceCatalogItem');

var createAustraliaBaseMapOptions = function(terria) {
    var result = [];

    var naturalEarthII = new WebMapServiceCatalogItem(terria);
    naturalEarthII.name = 'Natural Earth II';
    naturalEarthII.url = 'http://geoserver.nationalmap.nicta.com.au/imagery/natural-earth-ii/wms';
    naturalEarthII.layers = 'natural-earth-ii:NE2_HR_LC_SR_W_DR';
    naturalEarthII.parameters = {
        tiled: true,
        transparent: false,
        format: 'image/jpeg'
    };
    naturalEarthII.opacity = 1.0;
    naturalEarthII.isRequiredForRendering = true;

    var australianTopo = new ArcGisMapServerCatalogItem(terria);
    australianTopo.url = 'http://services.ga.gov.au/gis/rest/services/NationalMap_Colour_Topographic_Base_World_WM/MapServer';
    australianTopo.opacity = 1.0;
    australianTopo.isRequiredForRendering = true;
    australianTopo.name = 'Australian Topography';
    australianTopo.allowFeaturePicking = false;

    var australianHydroOverlay = new ArcGisMapServerCatalogItem(terria);
    australianHydroOverlay.name = 'Australian Hydrography';
    australianHydroOverlay.url = 'http://www.ga.gov.au/gis/rest/services/topography/AusHydro_WM/MapServer';
    australianHydroOverlay.opacity = 1.0;
    australianHydroOverlay.isRequiredForRendering = true;
    australianHydroOverlay.allowFeaturePicking = false;

    var australianHydro = new CompositeCatalogItem(terria, [naturalEarthII, australianHydroOverlay]);
    australianHydro.name = 'Australian Hydrography';

    // Wave Atlas Stuff
    var naturalEarthIIWA = new WebMapServiceCatalogItem(terria);
    naturalEarthIIWA.name = 'Natural Earth II WA';
    naturalEarthIIWA.url = 'http://www.cmar.csiro.au/geoserver/gwc/service/wms';
    naturalEarthIIWA.layers = 'ea-be:World_Bright-Earth-e-Atlas-basemap_No-Labels';
    naturalEarthIIWA.parameters = {
        tiled: true,
        transparent: false,
        format: 'image/png'
    };
    naturalEarthIIWA.opacity = 1.0;
    naturalEarthIIWA.isRequiredForRendering = true;
    naturalEarthIIWA.allowFeaturePicking = false;

    var australianWaveAtlasOverlay = new WebMapServiceCatalogItem(terria);
    australianWaveAtlasOverlay.layers = 'awavea-interim:outline_ww3.aus_4m';
    australianWaveAtlasOverlay.name = 'Study Area';
    australianWaveAtlasOverlay.url = 'http://oa-gis.csiro.au/geoserver/ows';
    australianWaveAtlasOverlay.isRequiredForRendering = true;
    australianWaveAtlasOverlay.allowFeaturePicking = false;
    australianWaveAtlasOverlay.parameters = {
        tiled: true,
        transparent: true,
        format: 'image/png'
    };

    var australianWaveAtlas = new CompositeCatalogItem(terria, [naturalEarthIIWA, australianWaveAtlasOverlay]);
    australianWaveAtlas.name = 'Australian Wave Atlas';

    result.push(new BaseMapViewModel({
        image: require('../../wwwroot/images/australian-topo.png'),
        catalogItem: australianTopo,
        contrastColor: '#000000'
    }));

    result.push(new BaseMapViewModel({
        image: require('../../wwwroot/images/hydro.png'),
        catalogItem: australianHydro,
    }));

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + '../../wwwroot/images/australian-waveatlas.png',
        catalogItem: australianWaveAtlas,
    }));

    return result;
};

module.exports = createAustraliaBaseMapOptions;
