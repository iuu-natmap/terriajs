/*
 * L.Handler.AltDragBox is used internally by L.Map to add alt-drag bbox.
 * Take with minor modification from L.Handler.ShiftDragZoom:
 *  https://searchcode.com/codesearch/raw/42524965/
 */

function installAltBox(L) {

L.Map.mergeOptions({
	altBox: true
});

L.Map.AltBox = L.Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._moved = false;
	},

	addHooks: function () {
		L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
		this._moved = false;
	},

	_onMouseDown: function (e) {
	  this._moved = false;

		if (!e.altKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		this._map.dragging.disable();
		L.DomUtil.disableTextSelection();
		L.DomUtil.disableImageDrag();

		this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

		L.DomEvent
		    .on(document, 'mousemove', this._onMouseMove, this)
				.on(document, 'mouseup', this._onMouseUp, this)
				.on(document, 'keydown', this._onKeyDown, this);

    console.log("onMouseDown");
	},

	_onMouseMove: function (e) {

	  if (!this._moved) {
      this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
      L.DomUtil.setPosition(this._box, this._startLayerPoint);

      //TODO refactor: move cursor to styles
      this._container.style.cursor = 'crosshair';
      this._map.fire('altboxstart');
    }
 
		var startPoint = this._startLayerPoint,
			box = this._box,

			layerPoint = this._map.mouseEventToLayerPoint(e),
			offset = layerPoint.subtract(startPoint),

			newPos = new L.Point(
				Math.min(layerPoint.x, startPoint.x),
				Math.min(layerPoint.y, startPoint.y));

		L.DomUtil.setPosition(box, newPos);

    this._moved = true;

		// TODO refactor: remove hardcoded 4 pixels
		box.style.width  = (Math.abs(offset.x) - 4) + 'px';
		box.style.height = (Math.abs(offset.y) - 4) + 'px';
    console.log("onMouseMove");
	},

	_finish: function () {
    if (this._moved) {
      this._pane.removeChild(this._box);
      this._container.style.cursor = '';
    }

		this._map.dragging.enable();
		L.DomUtil.enableTextSelection();
    L.DomUtil.enableImageDrag();

		L.DomEvent
        .off(document, 'mousemove', this._onMouseMove)
        .off(document, 'mouseup', this._onMouseUp)
        .off(document, 'keydown', this._onKeyDown);
  },

  _onMouseUp: function(e) {

    this._finish();

		var map = this._map,
			layerPoint = map.mouseEventToLayerPoint(e);

    if (this._startLayerPoint.equals(layerPoint)) { return; }

		var bounds = new L.LatLngBounds(
				map.layerPointToLatLng(this._startLayerPoint),
				map.layerPointToLatLng(layerPoint));

		map.fire("altboxend", {
			altBoxBounds: bounds
		});
    console.log("onMouseUp");
	},

  _onKeyDown: function (e) {

    if (e.keyCode === 27) {
      this._finish();
    }
  }
});

L.Map.addInitHook('addHandler', 'altBox', L.Map.AltBox);

};

var isAltBoxInstalled = false;

var LeafletAltBox = {
    initialize: function(leaflet) {
		    console.log("Leaflet AltBox Initialized");
        if (isAltBoxInstalled) {
            return;
        }
        isAltBoxInstalled = true;
        installAltBox(leaflet);
    }
};

module.exports = LeafletAltBox;
