import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  constructor(private ngZone: NgZone) {}

  @ViewChild('myGoogleMap')
  map!: GoogleMap;
  @ViewChild(MapInfoWindow)
  infoWindow!: MapInfoWindow;
  @ViewChild('search')
  searchElementRef!: ElementRef;
  @ViewChild('addressInput')
  addressInput!: HTMLInputElement;
  @ViewChild('cityInput')
  cityInput!: HTMLInputElement;
  @ViewChild('postalCodeInput')
  postalCodeInput!: HTMLInputElement;
  @ViewChild('countryInput')
  countryInput!: HTMLInputElement;

  zoom: number = 12;
  latitude!: number;
  longitude!: number;
  center!: google.maps.LatLngLiteral;

  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: false,
    mapTypeId: 'hybrid',
    maxZoom: 20,
    minZoom: 8,
  };
  infoWindowOptions: google.maps.InfoWindowOptions = {};

  placeResultInfos: google.maps.places.PlaceResult;
  markers: any[] = []; // TO DO: replace the any

  ngOnInit() {
    this.getCurrentPositionOfUser();
  }

  getCurrentPositionOfUser() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });
  }

  ngAfterViewInit(): void {
    this.setSearchBoxWidget();
  }

  setSearchBoxWidget() {
    // Binding searchbox to search input element
    let searchbox = new google.maps.places.SearchBox(
      this.searchElementRef.nativeElement
      // {bounds: TO DO}
    );
    this.getPlacesResults(searchbox);
  }

  getPlacesResults(searchbox: google.maps.places.SearchBox) {
    searchbox.addListener('places_changed', () => {
      this.ngZone.run(() => {
        // Get the places results
        let places: google.maps.places.PlaceResult[] = searchbox.getPlaces();

        // Verify results
        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        this.markers.length = 0;

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();

        places.forEach((place) => {
          if (!place.geometry || !place.geometry.location) {
            console.log('Returned place contains no geometry');
            return;
          }

          const icon = {
            url: place.icon as string,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
          };

          // Create a marker for each place.
          this.markers.push({
            map: this.map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            infoWindowContent: place.formatted_address,
          });

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
          console.log(place);
        });
        this.map.fitBounds(bounds);
      });
    });
  }

  setContentOfInfoWindow(infoWindowContent: any) {
    const contentToDisplayInInfoWindow = {
      content: `<div style="width: 100%; height:100%; background-color: #FF6666">
          <h1 style="color: white">Coucou</h1>
          <p style="color: white">${infoWindowContent}</p>
        </div>`,
    };
    this.infoWindowOptions = contentToDisplayInInfoWindow;
  }

  centerAndZoomMapToPlaceResult(place: google.maps.places.PlaceResult) {
    this.latitude = place.geometry.location?.lat();
    this.longitude = place.geometry.location?.lng();
    this.center = {
      lat: this.latitude,
      lng: this.longitude,
    };
    this.zoom = 15;
  }

  fillInAddressForm(place: google.maps.places.PlaceResult) {
    let address = '';

    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      const componentType = component.types[0];

      switch (componentType) {
        case 'street_number': {
          address = component.long_name;
          break;
        }

        case 'route': {
          address += ` ${component.long_name}`;
          break;
        }

        case 'postal_code': {
          this.postalCodeInput.value = component.long_name;
          break;
        }

        case 'locality':
          this.cityInput.value = component.long_name;
          break;

        case 'country': {
          this.countryInput.value = component.long_name;
          break;
        }
      }
    }
    this.addressInput.value = address;
  }

  openInfoWindowAfterClickOnMarker(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  logCenter() {
    console.log(JSON.stringify(this.map.getCenter()));
  }
}
