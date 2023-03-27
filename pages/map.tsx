import React from "react";
import {useLoadScript, GoogleMap, MarkerF, PolylineF} from '@react-google-maps/api';
import type {NextPage} from 'next';
import styles from '../styles/Map.module.css';
import {useMemo, useState} from "react";
import {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import {IDestinations, ICoord} from "@/types/map";


const libraries = ['places'];

const mapCenter = {lat: 50.450001, lng: 30.523333};

const polylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    zIndex: 1
};

const Map: NextPage = () => {
    const [destinations, setDestinations] = useState<IDestinations>({
        A: null,
        B: null,
        C: null
    });

    const [mapClicksCount, setMapClicksCount] = useState(0);
    const [coordsForPolylines, setCoordsForPolylines] = useState<ICoord[]>([]);
    const [planePosition, setPlanePosition] = useState<ICoord | null>(null);


    const mapOptions = useMemo<google.maps.MapOptions>(
        () => ({
            disableDefaultUI: true,
            clickableIcons: true,
            scrollwheel: false,
        }),
        []
    );

    const {isLoaded} = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries as any,
    });


    console.log("destinations", destinations);

    console.log("coordsForPolylines", coordsForPolylines);


    const constructRoute = () => {
        const updatedCoordsForPolylines = Object.values(destinations).map(destination => ({
            lat: destination.lat,
            lng: destination.lng
        }));

        setCoordsForPolylines(updatedCoordsForPolylines);


        if(destinations.A) {
            setPlanePosition({
                lat: destinations.A.lat,
                lng: destinations.A.lng
            });
        }

    };


    const numDeltas = 100;
    let delay = 10; //milliseconds
    let i = 0;
    let deltaLat: number;
    let deltaLng: number;
    let isLast: boolean;
    const moveMarkerFromAtoB = () => {

        const point1LatLng = new window.google.maps.LatLng(coordsForPolylines[0].lat, coordsForPolylines[0].lng)
        const point2LatLng = new window.google.maps.LatLng(coordsForPolylines[1].lat, coordsForPolylines[1].lng)

        const angle = window.google.maps.geometry.spherical.computeHeading(point1LatLng, point2LatLng)

        const marker = document.querySelector(`[src="/assets/plane_icon.png"]`) as HTMLElement;

        console.log("marker", marker);

        if (marker) { // when it hasn't loaded, it's null
            marker.style.transform = `rotate(${angle}deg)`
        }

        i = 0;
        isLast = false;
        deltaLat = (coordsForPolylines[1].lat - coordsForPolylines[0].lat) / numDeltas;
        deltaLng = (coordsForPolylines[1].lng - coordsForPolylines[0].lng) / numDeltas;

        moveMarker(coordsForPolylines[0].lat, coordsForPolylines[0].lng);
    }

    const moveMarkerFromBtoC = () => {

        const point1LatLng = new window.google.maps.LatLng(coordsForPolylines[1].lat, coordsForPolylines[1].lng);
        const point2LatLng = new window.google.maps.LatLng(coordsForPolylines[2].lat, coordsForPolylines[2].lng);


        const angle = window.google.maps.geometry.spherical.computeHeading(point1LatLng, point2LatLng);

        const marker = document.querySelector(`[src="/assets/plane_icon.png"]`) as HTMLElement;

        console.log("marker", marker);

        if (marker) { // when it hasn't loaded, it's null
            marker.style.transform = `rotate(${angle}deg)`
        }


        i = 0;
        isLast = true;

        deltaLat = (coordsForPolylines[2].lat - coordsForPolylines[1].lat) / numDeltas;
        deltaLng = (coordsForPolylines[2].lng - coordsForPolylines[1].lng) / numDeltas;


        const ACord = new google.maps.LatLng(coordsForPolylines[0].lat, coordsForPolylines[0].lng);
        const BCord = new google.maps.LatLng(coordsForPolylines[1].lat, coordsForPolylines[1].lng);
        const CCord = new google.maps.LatLng(coordsForPolylines[2].lat, coordsForPolylines[2].lng);


        const distanceBetweenAandB = google.maps.geometry.spherical.computeDistanceBetween(ACord, BCord);
        const distanceBetweenBandC = google.maps.geometry.spherical.computeDistanceBetween(BCord, CCord);

        delay = delay * distanceBetweenBandC / distanceBetweenAandB;


        moveMarker(coordsForPolylines[1].lat, coordsForPolylines[1].lng);
    }

    const movement = () => {
        moveMarkerFromAtoB();

    };

    const moveMarker = (initialLat: number, initialLng: number) => {
        if (i === numDeltas && isLast) {
            return;
        }

        if (i === numDeltas && !isLast) {
            moveMarkerFromBtoC();
            return;
        }


        initialLat += deltaLat;
        initialLng += deltaLng;

        setPlanePosition({
            lat: initialLat,
            lng: initialLng
        });

        i++;
        setTimeout(() => moveMarker(initialLat, initialLng), delay);

        console.log("i:", i, "deltaLat", deltaLat, "deltaLng", deltaLng, delay);

    };

    const onMapClick = (e) => {


        if (mapClicksCount === 3) return;

        if (mapClicksCount === 0) {
            setDestinations((prevState) => ({
                ...prevState,
                A: {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
        }));

            setMapClicksCount(1);
        }

        if (mapClicksCount === 1) {
            setDestinations((prevState) => ({
                ...prevState,
                B: {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
            }));

            setMapClicksCount(2);
        }

        if (mapClicksCount === 2) {
            setDestinations((prevState) => ({
                ...prevState,
                C: {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
            }));

            setMapClicksCount(3);
        }

    };

    console.log("coordsForPolylines", coordsForPolylines);
    console.log("planePosition", planePosition);

    if (!isLoaded) {
        return <p>Loading...</p>;
    }

    // @ts-ignore
    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <p>Select places</p>

                <ul className={styles.destinationsList}>
                    {Object.keys(destinations).map((destKey) => (
                        <li className={styles.destinationsList__item} key={destKey}>
                            <label>
                                {destKey}
                                <PlacesAutocomplete
                                    onAddressSelect={(address: string) => {
                                        getGeocode({address: address}).then((results) => {
                                            const {lat, lng} = getLatLng(results[0]);

                                            setDestinations((prevState
                                            ) => ({
                                                ...prevState,
                                                [destKey]: {lat: lat, lng: lng}
                                            }));
                                        });
                                    }}
                                    placeholder="Type place name"
                                />
                            </label>

                        </li>
                    ))}
                </ul>

                <button onClick={constructRoute}>Construct route</button>

                <button onClick={movement}>Move marker</button>

            </div>

            <GoogleMap
                options={mapOptions}
                zoom={3}
                center={mapCenter}
                mapTypeId={google.maps.MapTypeId.ROADMAP}
                mapContainerStyle={{width: '800px', height: '800px'}}
                onLoad={() => console.log('Map Loaded')}
                onClick={onMapClick}
            >

                {Object.keys(destinations).map((destKey) => {

                    if (destinations[destKey as keyof IDestinations]) {
                        return (
                            <React.Fragment key={destKey}>
                                <MarkerF
                                    position={destinations[destKey as keyof IDestinations]}
                                    onLoad={() => console.log('Marker Loaded', destinations[destKey as keyof IDestinations]?.lat, destinations[destKey as keyof IDestinations]?.lng)}
                                    label={destKey}

                                />
                            </React.Fragment>

                        )
                    }

                })}

                {planePosition && <MarkerF
                    position={planePosition}
                    onLoad={() => console.log('Marker Loaded')}
                    title="plane"
                    icon={{
                        url: "/assets/plane_icon.png",
                        scaledSize: new window.google.maps.Size(20, 20),
                        anchor: {x: 10, y: 10}
                    }}
                />}


                <PolylineF
                    path={coordsForPolylines}
                    options={polylineOptions}
                />
            </GoogleMap>
        </div>
    )
}

export default Map;
