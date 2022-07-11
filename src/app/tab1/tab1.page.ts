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
  autocompleteOptions: google.maps.places.AutocompleteOptions = {
    types: ['restaurant'],
    fields: ['address_components', 'geometry'],
    componentRestrictions: { country: ['fr', 'be', 'ch', 'lu'] },
    // TO DO: add location boundaries
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
    this.setAutocompleteWidget();
  }

  setAutocompleteWidget() {
    // Binding autocomplete to search input element
    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement,
      this.autocompleteOptions
    );
    this.getPlaceResult(autocomplete);
  }

  getPlaceResult(autocomplete: google.maps.places.Autocomplete) {
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        // Get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

        // Verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }

        this.getInfosAndNavigateToPlaceResult(place);
      });
    });
  }

  getInfosAndNavigateToPlaceResult(place: google.maps.places.PlaceResult) {
    console.log({ place });
    this.placeResultInfos = place;
    this.displayMarkerOfPlaceResult(place);
    this.setContentOfInfoWindow(place);
    this.centerAndZoomMapToPlaceResult(place);
    this.fillInAddressForm(place);
  }

  displayMarkerOfPlaceResult(place: google.maps.places.PlaceResult) {
    this.markers.length = 0;
    this.markers.push({
      position: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
    });
  }

  setContentOfInfoWindow(place: google.maps.places.PlaceResult) {
    const cityOfPlaceResult: string = place.address_components[2].long_name;
    const contentToDisplayInInfoWindow = {
      content: `<div style="width: 100%; height:100%; background-color: #FF6666">
          <h1 style="color: white">Coucou</h1>
          <p style="color: white">${cityOfPlaceResult}</p>
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
