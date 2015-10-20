		var overlay, overlay2, json;
		var swBound = new google.maps.LatLng(61.033528,27.660169);
		var neBound = new google.maps.LatLng(61.428019,28.731508);
		var areaBounds = new google.maps.LatLngBounds(swBound, neBound);
		var srcImage = 'assets/img/kartta2.jpg';
		var infoBox;
		var markers = [];
		var bigmap;
		
		MapOverlay.prototype = new google.maps.OverlayView();
			// [START region_constructor]
		/** @constructor */
		function MapOverlay(areaBounds, image, map) {
			// Initialize all properties.
			this.bounds_ = areaBounds;
			this.image_ = image;
			this.map_ = map;
			// Define a property to hold the image's div. We'll
			// actually create this div upon receipt of the onAdd()
			// method so we'll leave it null for now.
			this.div_ = null;
			// Explicitly call setMap on this overlay.
			this.setMap(map);
		}
		// [END region_constructor]

		// [START region_attachment]
		/**
		 * onAdd is called when the map's panes are ready and the overlay has been
		 * added to the map.
		 */
		MapOverlay.prototype.onAdd = function() {
		
			var div = document.createElement('div');
			div.style.borderStyle = 'none';
			div.style.borderWidth = '0px';
			div.style.position = 'absolute';
		
			// Create the img element and attach it to the div.
			var img = document.createElement('img');
			img.src = this.image_;
			img.style.width = '100%';
			img.style.height = '100%';
			img.style.position = 'absolute';
			div.appendChild(img);
		
			this.div_ = div;
		
			// Add the element to the "overlayLayer" pane.
			var panes = this.getPanes();
			panes.overlayLayer.appendChild(div);
		};
		// [END region_attachment]
		
		// [START region_drawing]
		MapOverlay.prototype.draw = function() {
		
			// We use the south-west and north-east
			// coordinates of the overlay to peg it to the correct position and size.
			// To do this, we need to retrieve the projection from the overlay.
			var overlayProjection = this.getProjection();

			// Retrieve the south-west and north-east coordinates of this overlay
			// in LatLngs and convert them to pixel coordinates.
			// We'll use these coordinates to resize the div.
			var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
			var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

			// Resize the image's div to fit the indicated dimensions.
			var div = this.div_;
			div.style.left = sw.x + 'px';
			div.style.top = ne.y + 'px';
			div.style.width = (ne.x - sw.x) + 'px';
			div.style.height = (sw.y - ne.y) + 'px';
		};
		// [END region_drawing]

		// [START region_removal]
		// The onRemove() method will be called automatically from the API if
		// we ever set the overlay's map property to 'null'.
		MapOverlay.prototype.onRemove = function() {
			this.div_.parentNode.removeChild(this.div_);
			this.div_ = null;
		};
		
		function InfoBox(opts) {
			google.maps.OverlayView.call(this);
			this.latlng_ = opts.latlng;
			this.map_ = opts.map;
			this.height_ = 200;
			this.width_ = 400;
			this.offsetVertical_ = -(this.height_*0.9);
			this.offsetHorizontal_ = 0;
			this.content_ = opts.content;
			this.logo_ = opts.logo;
			this.title_ = opts.title;
			this.url_ = opts.url;
			this.padX_ = 40;
			this.padY_ = 40;
			var me = this;
			this.boundsChangedListener_ = google.maps.event.addListener(this.map_, "bounds_changed", function() {
				return me.panMap.apply(me);
			});
		
			// Once the properties of this OverlayView are initialized, set its map so
			// that we can display it.  This will trigger calls to panes_changed and
			// draw.
			this.setMap(this.map_);
		}

		InfoBox.prototype = new google.maps.OverlayView();

		/* Creates the DIV representing this InfoBox
		 */
		InfoBox.prototype.remove = function() {
			if (this.div_) {
				this.div_.parentNode.removeChild(this.div_);
				this.div_ = null;
			}
		};
		
		/* Redraw the Bar based on the current projection and zoom level
		 */
		InfoBox.prototype.draw = function() {
			
			// Creates the element if it doesn't exist already.
			this.createElement();
			if (!this.div_) return;


			// Calculate the DIV coordinates of two opposite corners of our bounds to
			// get the size and position of our Bar
			var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
			if (!pixPosition) return;
			// Now position our DIV based on the DIV coordinates of our bounds
			this.div_.style.width = this.width_ + "px";
			this.div_.style.left = (pixPosition.x + this.offsetHorizontal_ + 20) + "px";
			//this.div_.style.height = this.height_ + "px";
			this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
			this.div_.style.display = 'block';
		};
		
		/* Creates the DIV representing this InfoBox in the floatPane.  If the panes
		 * object, retrieved by calling getPanes, is null, remove the element from the
		 * DOM.  If the div exists, but its parent is not the floatPane, move the div
		 * to the new pane.
		 * Called from within draw.  Alternatively, this can be called specifically on
		 * a panes_changed event.
		 */
		InfoBox.prototype.createElement = function() {
			var panes = this.getPanes();
			var div = this.div_;
			if (!div) {
				// This does not handle changing panes.  You can set the map to be null and
				// then reset the map to move the div.
				div = this.div_ = document.createElement("div");
				div.id = "infobox";
				var norppaImg = document.createElement("img");
				norppaImg.src = "assets/img/norppa.png";
				norppaImg.className = "norppaimage";
				div.appendChild(norppaImg);
				var contentDiv = document.createElement("div");
				contentDiv.className = "greeting";
				/*
				var contentP = document.createElement("p");
				contentP.innerHTML = this.content_;
				contentDiv.appendChild(contentP);
				*/
				var contentSpan = document.createElement("span");
				contentSpan.innerHTML = this.content_;
				contentDiv.appendChild(contentSpan);
				
				var contentH2 = document.createElement("h2");
				contentH2.innerHTML = this.title_;
				contentDiv.appendChild(contentH2);
				
				if (this.logo_) {
					var contentImg = document.createElement("img");
					contentImg.src = this.logo_? ("/mediabank/" + this.logo_ + "_sealnestlogo.jpg"): "";
					contentImg.style.maxWidth = "200px";
					contentImg.style.maxHeight = "200px";
					contentDiv.appendChild(contentImg);
				}
				
				/* var contentLink = document.createElement("a");
				var linkText = document.createTextNode(this.url_);
				contentLink.href = this.url_;
				contentLink.target = "_blank";
				contentLink.style.display = "block";
				contentLink.appendChild(linkText);
				contentDiv.appendChild(contentLink); */
				
				var topDiv = document.createElement("div");
				topDiv.style.textAlign = "right";
				topDiv.style.position = "absolute";
				topDiv.style.right = 0;
				topDiv.style.top = 0;
				var closeImg = document.createElement("img");
				closeImg.style.width = "32px";
				closeImg.style.height = "32px";
				closeImg.style.cursor = "pointer";
				closeImg.src = "assets/img/close.gif";
				topDiv.appendChild(closeImg);
				var logoImg = document.createElement("img");
				logoImg.src = "http://wwf.fi/assets/css/img/wwf_logo_104x119.svg";
				logoImg.style.width = "15%";
				logoImg.style.position = "absolute";
				logoImg.style.left = "20px";
				logoImg.style.top = "0";
				
				function removeInfoBox(ib) {
					return function() {
						ib.setMap(null);
					};
				}

				google.maps.event.addDomListener(closeImg, 'click', removeInfoBox(this));
		
				div.appendChild(contentDiv);
				div.appendChild(logoImg);
				div.style.display = 'none';
				div.appendChild(topDiv);
				
				panes.floatPane.appendChild(div);
				this.panMap();
			} else if (div.parentNode != panes.floatPane) {
				// The panes have changed.  Move the div.
				div.parentNode.removeChild(div);
				panes.floatPane.appendChild(div);
			} else {
				// The panes have not changed, so no need to create or move the div.
			}
		}

		/* Pan the map to fit the InfoBox.
		 */
		InfoBox.prototype.panMap = function() {
			// if we go beyond map, pan map
			var map = this.map_;
			var bounds = map.getBounds();
			if (!bounds) return;
		
			// The position of the infowindow
			var position = this.latlng_;
		
			// The dimension of the infowindow
			var iwWidth =  this.width_;
			var iwHeight = this.height_;
		
			// The offset position of the infowindow
			var iwOffsetX = this.offsetHorizontal_;
			var iwOffsetY = this.offsetVertical_;
		
			// The degrees per pixel
			var mapDiv = map.getDiv();
			var mapWidth = mapDiv.offsetWidth;
			var mapHeight = mapDiv.offsetHeight;
			var boundsSpan = bounds.toSpan();
			var longSpan = boundsSpan.lng();
			var latSpan = boundsSpan.lat();
			var degPixelX = longSpan / mapWidth;
			var degPixelY = latSpan / mapHeight;

			// The bounds of the map
			var mapWestLng = bounds.getSouthWest().lng();
			var mapEastLng = bounds.getNorthEast().lng();
			var mapNorthLat = bounds.getNorthEast().lat();
			var mapSouthLat = bounds.getSouthWest().lat();

			// The bounds of the infowindow
			var iwWestLng = position.lng()  + (iwOffsetX - this.padX_) * degPixelX;
			var iwEastLng = position.lng()  + (iwOffsetX + iwWidth + this.padX_) * degPixelX;
			var iwNorthLat = position.lat() - (iwOffsetY - this.padY_) * degPixelY;
			var iwSouthLat = position.lat() - (iwOffsetY + iwHeight + this.padY_) * degPixelY;
		
			// calculate center shift
			var shiftLng = (iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) + (iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
			var shiftLat = (iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) + (iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);
		
			// The center of the map
			var center = map.getCenter();
		
			// The new map center
			var centerX = center.lng() - shiftLng;
			var centerY = center.lat() - shiftLat;
		
			// center the map to the new shifted center
			map.setCenter(new google.maps.LatLng(centerY, centerX));
		
			// Remove the listener after panning is complete.
			google.maps.event.removeListener(this.boundsChangedListener_);
			this.boundsChangedListener_ = null;
		};

		function getPosition(element) {
			var xPosition = 0;
			var yPosition = 0;
			
			while(element) {
				xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
				yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
				element = element.offsetParent;
			}
			return { x: xPosition, y: yPosition };
		}
		
		function openMapModal(){
			$('#dialog-modal').show();
			$('#show_modal').hide();
			var addresspickerMap = $( "#addresspicker_map" ).addresspicker({
				regionBias: "fi",
				reverseGeocode: 'false',
				mapOptions: {
					zoom: 9,
					center: new google.maps.LatLng(61.2307735,28.1958385),
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControl: false,
					scrollwheel: false,
					streetViewControl: false,
					zoomControl: false,
					draggable: false,
					keyboardShortcuts: false,
					disableDoubleClickZoom: true,
				},
				elements: {
					map:           '#map',
					lat:           '#latitude',
					lng:           '#longitude',
					street_number: '#street_number'
				}
			});

			addMarkers( $("#addresspicker_map").addresspicker("map"), false );
			
			addresspickermap = document.getElementById('addresspicker_map');
			addresspickermap.style.height = "298px";
			addresspickermap.style.width = "222px";
			
			var map2 = $("#addresspicker_map").addresspicker("map");
			overlay2 = new MapOverlay(areaBounds, srcImage, map2);
			addresspickerMap.addresspicker( "updatePosition");
	
			var gmarker = addresspickerMap.addresspicker( "marker");
			var randx = (0.27*Math.random())+61.05;
			var randy = (0.9*Math.random())+27.7;
			gmarker.setPosition(new google.maps.LatLng(randx,randy));
			gmarker.setVisible(true);
			addresspickerMap.addresspicker( "updatePosition");
	
		};
		
		function refreshMarkers(){
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
			addMarkers( bigmap, true );
		};
		
		function addMarkers( map, addInfowindow ){
			var query = window.location.search.substring(1).split("&");
			if (window.XMLHttpRequest) {
				xmlhttp=new XMLHttpRequest();
			} else {// code for IE6, IE5
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.addInfowindow = addInfowindow;
			xmlhttp.onreadystatechange = function(){
				if (xmlhttp.readyState==4 && xmlhttp.status==200) {
					json = JSON.parse(xmlhttp.responseText);
					for(var i = 0; i < json.data.sealnest.length; i++) {
						var myLatLng = new google.maps.LatLng(json.data.sealnest[i].lat,json.data.sealnest[i].lng);
						if (this.addInfowindow) {
							var marker = new google.maps.Marker( {
											position: myLatLng,
											map: map, 
											icon: {url:'assets/img/pesa.png',size: new google.maps.Size(30, 20),scaledSize: new google.maps.Size(30,20)}, 
											title: json.data.sealnest[i].company,
											content: json.data.sealnest[i].message,
											logo: json.data.sealnest[i].logo,
											url: json.data.sealnest[i].website
										});
							markers.push(marker);
							google.maps.event.addListener(marker, "click", function(e) {
								if (infoBox) {
									 infoBox.setMap(null);
								}
								infoBox = new InfoBox({
											latlng: this.getPosition(), 
											map: map, 
											content: this.content, 
											title: this.title, 
											logo: this.logo, 
											url: this.url 
								});
							});
							if ( query[0] === json.data.sealnest[i].id ) {
								var infoBox = new InfoBox({
												latlng: new google.maps.LatLng(json.data.sealnest[i].lat,json.data.sealnest[i].lng),
												map: map,
												content: json.data.sealnest[i].message, 
												title: json.data.sealnest[i].company, 
												logo: json.data.sealnest[i].logo, 
												url: json.data.sealnest[i].website 
								});
								var mapcontainer = document.getElementById('map-section');
								 $('html, body').animate({ scrollTop: $("#map-canvas").offset().top }, 2000);
							}
						} else {
							var marker = new google.maps.Marker( { 
								position: myLatLng, 
								map: $("#addresspicker_map").addresspicker("map"),
								icon: {url:'/joulu/yritys/assets/img/pesa.png',size: new google.maps.Size(15, 10),scaledSize: new google.maps.Size(15,10)}
							});
						}
					}
				}
			}
			xmlhttp.open("GET","assets/json/data.json",true);
			xmlhttp.send();
		}

		// Initialize the map and the custom overlay.
		function initialize() {
			if (document.getElementById('map-canvas')){
				var groundStyle = [ { "stylers": [ { "visibility": "on" }, { "color": "#ffffff" } ] } ];
				var mapOptions = {
					zoom: 11,
					mapTypeControl: false,
					scaleControl: false,
					streetViewControl: false,
					overviewMapControl: false,
					center: new google.maps.LatLng(61.238497,28.300466),
					mapTypeId: 'groundStyle',
					tileSize: new google.maps.Size(256, 256),
					isPng: true,
					minZoom: 10,
					maxZoom: 12,
					backgroundColor: '#FFFFFF'
				};
				bigmap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
				bigmap.mapTypes.set('groundStyle', new google.maps.StyledMapType(groundStyle, { name: 'My Style' }));
				
				addMarkers( bigmap, true );
				
				overlay = new MapOverlay(areaBounds, srcImage, bigmap);
				
				google.maps.event.addListener(bigmap, 'dragend', function() {
					if (!areaBounds.contains(bigmap.getCenter())) {
					// We're out of bounds - Move the map back within the bounds
			
						var c = bigmap.getCenter(),
							x = c.lng(),
							y = c.lat(),
							maxX = areaBounds.getNorthEast().lng(),
							maxY = areaBounds.getNorthEast().lat(),
							minX = areaBounds.getSouthWest().lng(),
							minY = areaBounds.getSouthWest().lat();
						if (x < minX) x = minX;
						if (x > maxX) x = maxX;
						if (y < minY) y = minY;
						if (y > maxY) y = maxY;
					
						bigmap.setCenter(new google.maps.LatLng(y, x));
					}
				});
				google.maps.event.addDomListener(window, "resize", function() {
					var center = bigmap.getCenter();
					google.maps.event.trigger(bigmap, "resize");
					bigmap.setCenter(center); 
				});
			}
/*			$('#location_form').submit(function(e) {
				var orig = $('#location_form').serialize();
				var withoutEmpties = orig.replace(/[^&]+=\.?(?:&|$)/g, '')
				e.preventDefault();
				$.ajax({
					type: "POST",
					url: "/sealnest/rest",
					data: new FormData( $('#location_form')[0]),
					enctype: 'multipart/form-data',
					contentType: false,
					processData: false,
					success: function(data){
						if (data.status == "OK"){
							$('#dialog-modal').hide();
							$('#sealnest-set').show();
							document.location = $('#return_success_button').attr('href');
						} else {
							alert('Jotain meni pieleen, kokeile hetken kuluttua uudelleen');
						}
					},
					dataType: 'json'
				});
			});
			$("#uploadBtn").change(function(){
				$("#uploadFile")[0].value = this.value;
			});
			
			$("#example").click(function(e){
				e.preventDefault();
				$("#example img").toggle();
			});
			*/
		}
			

			//document.getElementById('map-canvas').style.background = "transparent url('/joulu/yritys/assets/img/kartta_tausta.jpg')";
			// [END region_initialization]

	
		// [END region_removal]
		//google.maps.event.addDomListener(window, 'load', initialize);
		window.addEventListener("load", initialize, false);
		
			