import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RestaurantUser } from '../models/restaurant-user';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  constructor(private ngZone: NgZone, private afs: AngularFirestore) {}

  @ViewChild('myGoogleMap')
  map!: GoogleMap;
  @ViewChild(MapInfoWindow)
  infoWindow!: MapInfoWindow;
  @ViewChild('search')
  searchElementRef!: ElementRef;

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

  markers: any[] = []; // TO DO: replace the any
  searchboxResults: any[] = []; // TO DO: replace the any

  checkIfRestaurantOfSearchboxResultsIsSignedUp() {
    for (let i = 0; i < this.searchboxResults.length; i++) {
      this.getRestaurantByPlaceId(this.searchboxResults[i].place_id).subscribe(
        (restaurant) => {
          if (restaurant[0]) {
            this.searchboxResults[i].isSignedUp = true;
          }
        }
      );
    }
  }

  getRestaurantByPlaceId(placeId: string): Observable<RestaurantUser[]> {
    return this.afs
      .collection<RestaurantUser>('restaurant-users', (ref) =>
        ref.where('placeId', '==', placeId)
      )
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => {
            const data = c.payload.doc.data() as RestaurantUser;
            const id = c.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

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

        // Clear out the previous results & markers.
        this.searchboxResults.length = 0;
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
          this.searchboxResults.push(place);
        });
        this.checkIfRestaurantOfSearchboxResultsIsSignedUp();
        this.map.fitBounds(bounds);
      });
    });
  }

  setContentOfInfoWindow(marker: any) {
    const contentToDisplayInInfoWindow = {
      content: `<div style="width: 100%; height:100%;">
          <p style="color: #123456; font-weight: bold; font-size: 1.2rem;">${marker.title}</p>
          <p style="color: #123456">${marker.infoWindowContent}</p>
        </div>`,
    };
    this.infoWindowOptions = contentToDisplayInInfoWindow;
  }

  openInfoWindowAfterClickOnMarker(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  searchRestaurantTypeFromChip(restaurantType: string) {
    const searchInput = this.searchElementRef.nativeElement as HTMLInputElement;
    searchInput.value = restaurantType;
    this.focusInputAndPressEnter(searchInput);
  }

  focusInputAndPressEnter(input: HTMLInputElement) {
    const pressEnterEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      keyCode: 13,
    });
    input.focus();
    input.dispatchEvent(pressEnterEvent);
    input.blur();
  }
}
