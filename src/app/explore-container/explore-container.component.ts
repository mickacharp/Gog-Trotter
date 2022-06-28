import { Component, OnInit, Input } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;

  apiKey = '';

  constructor() {}

  ngOnInit() {
    this.initMap();
  }

  // mapRef = document.getElementById('map');
  // newMap = GoogleMap.create({
  //   id: 'my-map', // Unique identifier for this map instance
  //   element: this.mapRef, // reference to the capacitor-google-map element
  //   apiKey: this.apiKey, // Your Google Maps API Key
  //   config: {
  //     center: {
  //       // The initial position to be rendered by the map
  //       lat: 43.48,
  //       lng: -1.56,
  //     },
  //     zoom: 12, // The initial zoom level to be rendered by the map
  //   },
  // });

  map: google.maps.Map;
  service: google.maps.places.PlacesService;
  infowindow: google.maps.InfoWindow;

  initMap(): void {
    const sydney = new google.maps.LatLng(-33.867, 151.195);

    this.infowindow = new google.maps.InfoWindow();

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: sydney,
        zoom: 15,
      }
    );

    const request = {
      query: 'Etxeko Pizza',
      fields: ['name', 'geometry'],
    };

    this.service = new google.maps.places.PlacesService(this.map);

    this.service.findPlaceFromQuery(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          for (let i = 0; i < results.length; i++) {
            this.createMarker(results[i]);
          }

          this.map.setCenter(results[0].geometry!.location!);
        }
      }
    );
  }

  createMarker(place: google.maps.places.PlaceResult) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
    });

    google.maps.event.addListener(marker, 'click', () => {
      this.infowindow.setContent(place.name || '');
      this.infowindow.open(this.map);
    });
  }
}
