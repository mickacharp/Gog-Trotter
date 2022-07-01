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

  title = 'angular-google-maps-app';

  @ViewChild('myGoogleMap')
  map!: GoogleMap;
  @ViewChild(MapInfoWindow)
  info!: MapInfoWindow;
  @ViewChild('search')
  searchElementRef!: ElementRef;

  zoom: number = 12;
  maxZoom: number = 20;
  minZoom: number = 8;
  center!: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    mapTypeId: 'hybrid',
    maxZoom: this.maxZoom,
    minZoom: this.minZoom,
  };
  markers: any[] = [];
  infoContent: string = '';
  latitude!: any;
  longitude!: any;
  placeResultInfos: google.maps.places.PlaceResult;

  ngAfterViewInit(): void {
    // Binding autocomplete to search input control
    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement,
      {
        types: ['restaurant'],
        fields: ['address_components', 'geometry'],
        componentRestrictions: { country: ['fr', 'be', 'ch', 'lu'] },
        // location boundaries to add!!!!
      }
    );
    // Align search box to center
    // this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    //   this.searchElementRef.nativeElement
    // );
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        //get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }
        this.placeResultInfos = place;
        console.log({ place });

        //set latitude, longitude and zoom
        this.latitude = place.geometry.location?.lat();
        this.longitude = place.geometry.location?.lng();
        this.center = {
          lat: this.latitude,
          lng: this.longitude,
        };
      });
    });
  }

  ngOnInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });
  }

  eventHandler(event: any, name: string) {
    console.log(name);

    // Add marker on double click event
    if (name === 'mapDblclick') {
      this.dropMarker(event);
    }
  }

  // Markers
  logCenter() {
    console.log(JSON.stringify(this.map.getCenter()));
  }

  dropMarker(event: any) {
    this.markers.push({
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
      label: {
        color: 'blue',
        text: 'Marker label ' + (this.markers.length + 1),
      },
      title: 'Marker title ' + (this.markers.length + 1),
      info: 'Marker info ' + (this.markers.length + 1),
      options: {
        animation: google.maps.Animation.DROP,
      },
    });
  }

  openInfo(marker: MapMarker, content: string) {
    this.infoContent = content;
    this.info.open(marker);
  }
}

// GOOGLE TYPESCRIPT DOCS MAPS

// map: google.maps.Map;
// service: google.maps.places.PlacesService;
// infowindow: google.maps.InfoWindow;

// initMap(): void {
//   const sydney = new google.maps.LatLng(-33.867, 151.195);

//   this.infowindow = new google.maps.InfoWindow();

//   this.map = new google.maps.Map(
//     document.getElementById('map') as HTMLElement,
//     {
//       center: sydney,
//       zoom: 15,
//     }
//   );

//   const request = {
//     query: 'Etxeko Pizza',
//     fields: ['name', 'geometry'],
//   };

//   this.service = new google.maps.places.PlacesService(this.map);

//   this.service.findPlaceFromQuery(
//     request,
//     (
//       results: google.maps.places.PlaceResult[] | null,
//       status: google.maps.places.PlacesServiceStatus
//     ) => {
//       if (status === google.maps.places.PlacesServiceStatus.OK && results) {
//         for (let i = 0; i < results.length; i++) {
//           this.createMarker(results[i]);
//         }

//         this.map.setCenter(results[0].geometry!.location!);
//       }
//     }
//   );
// }

// createMarker(place: google.maps.places.PlaceResult) {
//   if (!place.geometry || !place.geometry.location) return;

//   const marker = new google.maps.Marker({
//     map: this.map,
//     position: place.geometry.location,
//   });

//   google.maps.event.addListener(marker, 'click', () => {
//     this.infowindow.setContent(place.name || '');
//     this.infowindow.open(this.map);
//   });
// }
