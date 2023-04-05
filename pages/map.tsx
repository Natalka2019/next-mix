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
import Modal from "@/components/Modal";
import InformationModal from "@/components/InformationModal";
import {useRouter} from "next/router";


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

const destinationClicks = ["A", "B", "C"];

const Map: NextPage = () => {
    const router = useRouter();
    const {userEmail} = router.query;

    const [destinations, setDestinations] = useState<IDestinations>({
        A: null,
        B: null,
        C: null
    });

    const [mapClicksCount, setMapClicksCount] = useState(0);
    const [coordsForPolylines, setCoordsForPolylines] = useState<ICoord[]>([]);
    const [planePosition, setPlanePosition] = useState<ICoord | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [distance, setDistance] = useState(0);
    const [pointALatLng, setPointALatLng] = useState<google.maps.LatLng>();
    const [pointBLatLng, setPointBLatLng] = useState<google.maps.LatLng>();
    const [pointCLatLng, setPointCLatLng] = useState<google.maps.LatLng>();

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

    const constructRoute = () => {
        const updatedCoordsForPolylines = Object.values(destinations).map(destination => ({
            lat: destination.lat,
            lng: destination.lng
        }));

        setCoordsForPolylines(updatedCoordsForPolylines);


        if (destinations.A) {
            setPlanePosition({
                lat: destinations.A.lat,
                lng: destinations.A.lng
            });
        }

        setPointALatLng(createGoogleLatLngObject(destinations.A?.lat, destinations.A?.lng));
        setPointBLatLng(createGoogleLatLngObject(destinations.B?.lat, destinations.B?.lng));
        setPointCLatLng(createGoogleLatLngObject(destinations.C?.lat, destinations.C?.lng));

    };


    const numDeltas = 100;
    let delay = 10; //milliseconds
    let i = 0;
    let deltaLat: number;
    let deltaLng: number;
    let isLast: boolean;

    const createGoogleLatLngObject = (lat: number | undefined, lng: number | undefined) => {
        if (lat && lng) {
            return new window.google.maps.LatLng(lat, lng)
        }
    };

    const rotatePlane = (point1LatLng: google.maps.LatLng, point2LatLng: google.maps.LatLng) => {
        const angle = window.google.maps.geometry.spherical.computeHeading(point1LatLng, point2LatLng);
        const marker = document.querySelector(`[src="/assets/plane_icon.png"]`) as HTMLElement;

        if (marker) {
            marker.style.transform = `rotate(${angle}deg)`
        }
    }
    const moveMarkerFromAtoB = () => {
        if (pointALatLng && pointBLatLng) {
            rotatePlane(pointALatLng, pointBLatLng);
        }

        i = 0;
        isLast = false;

        if (destinations.A && destinations.B) {
            deltaLat = (destinations.B?.lat - destinations.A?.lat) / numDeltas;
            deltaLng = (destinations.B?.lng - destinations.A?.lng) / numDeltas;

            moveMarker(destinations.A?.lat, destinations.A?.lng);
        }

    }

    const moveMarkerFromBtoC = () => {
        let distanceBetweenAandB;
        let distanceBetweenBandC;

        if (pointALatLng && pointBLatLng && pointCLatLng) {
            rotatePlane(pointBLatLng, pointCLatLng);

            distanceBetweenAandB = window.google.maps.geometry.spherical.computeDistanceBetween(pointALatLng, pointBLatLng);
            distanceBetweenBandC = window.google.maps.geometry.spherical.computeDistanceBetween(pointBLatLng, pointCLatLng);

            delay = delay * distanceBetweenBandC / distanceBetweenAandB;
        }


        i = 0;
        isLast = true;

        if (destinations.B && destinations.C) {
            deltaLat = (destinations.C?.lat - destinations.B?.lat) / numDeltas;
            deltaLng = (destinations.C?.lng - destinations.B?.lng) / numDeltas;

            moveMarker(destinations.B?.lat, destinations.B?.lng);
        }

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

    };

    const onMapClick = (e: any) => {

        if (mapClicksCount === 3) return;

        setDestinations((prevState) => ({
            ...prevState,
            [destinationClicks[mapClicksCount]]: {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            }
        }));

        setMapClicksCount(prevState => prevState + 1);

    };

    const showPaymentModal = () => {


        if (pointALatLng && pointBLatLng && pointCLatLng) {
            const distanceBetweenAandB = window.google.maps.geometry.spherical.computeDistanceBetween(pointALatLng, pointBLatLng);
            const distanceBetweenBandC = window.google.maps.geometry.spherical.computeDistanceBetween(pointBLatLng, pointCLatLng);


            setDistance(distanceBetweenAandB + distanceBetweenBandC);
        }

        setShowModal(true)
    };


    if (!isLoaded) {
        return <p>Loading...</p>;
    }


    return (
        <>
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

                    {/*<button onClick={movement}>Move marker</button>*/}

                    <button onClick={showPaymentModal}>Show payment modal</button>

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
            {showModal && <Modal
                onClose={() => setShowModal(false)}
                show={showModal}
            >
                <InformationModal userEmail={userEmail} distance={distance} onClose={() => setShowModal(false)}
                                  movement={movement}/>
            </Modal>}

        </>
    )
}

export default Map;
