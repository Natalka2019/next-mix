import React from "react";
import {useLoadScript, GoogleMap, MarkerF, PolylineF} from '@react-google-maps/api';
import type {NextPage} from 'next';
import {useRouter} from "next/router";
import {useMemo, useState} from "react";
import {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';


import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import {ICoord, IDestinations} from "@/types/map";
import Modal from "@/components/Modal";
import InformationModal from "@/components/InformationModal";
import {getSimpleStringFromParam} from "@/utils/getSimpleStringFromParams";
import {extractCityAndCountryFromAddress, getCityAndCountry} from "@/utils/getCityAndCountry";
import Header from "@/components/Header";
import PageWrapper from "@/components/PageWrapper";
import useConstructRoute from "@/hooks/useConstructRoute";

import styles from '../styles/Map.module.css';
import useMoveMarker from "@/hooks/useMoveMarker";


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
    const {userEmail, userName} = router.query;
    const email = getSimpleStringFromParam(userEmail);
    const name = getSimpleStringFromParam(userName);

    const [destinations, setDestinations] = useState<IDestinations>({
        A: null,
        B: null,
        C: null
    });

    const [mapClicksCount, setMapClicksCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [distance, setDistance] = useState(0);
    const [selectNewRoute, setSelectNewRoute] = useState(false);
    const [planePosition, setPlanePosition] = useState<ICoord | null>(null);
    const [pointALatLng, setPointALatLng] = useState<google.maps.LatLng>();
    const [pointBLatLng, setPointBLatLng] = useState<google.maps.LatLng>();
    const [pointCLatLng, setPointCLatLng] = useState<google.maps.LatLng>();

    const rotatePlane = (point1LatLng: google.maps.LatLng, point2LatLng: google.maps.LatLng) => {
        const angle = window.google.maps.geometry.spherical.computeHeading(point1LatLng, point2LatLng);
        const marker = document.querySelector(`[src="/assets/plane_icon.png"]`) as HTMLElement;

        if (marker) {
            marker.style.transform = `rotate(${angle}deg)`
        }
    }

    const {
        constructRoute,
        coordsForPolylines,
        setCoordsForPolylines
    } = useConstructRoute(
        {
            setPlanePosition,
            setPointALatLng,
            setPointBLatLng,
            setPointCLatLng
        }
    );

    const {
        movement
    } = useMoveMarker(
        {
            setPlanePosition,
            destinations,
            rotatePlane,
            pointALatLng,
            pointBLatLng,
            pointCLatLng,
            setSelectNewRoute
        }
    );

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

    const onMapClick = async (e: any) => {

        if (mapClicksCount === 3) return;

        const {city, country} = await getCityAndCountry(e.latLng);


        setDestinations((prevState) => ({
            ...prevState,
            [destinationClicks[mapClicksCount]]: {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                city,
                country
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

    const onAddressSelect = async (address: string, destKey: string) => {

        const results = await getGeocode({address: address});

        const {lat, lng} = getLatLng(results[0]);

        const {extractedCity, extractedCountry} = extractCityAndCountryFromAddress(results[0].address_components);

        setDestinations((prevState
        ) => ({
            ...prevState,
            [destKey]: {lat: lat, lng: lng, extractedCity, extractedCountry}
        }));

    }


    const clearSelections = () => {
        setDestinations({
            A: null,
            B: null,
            C: null
        });

        setMapClicksCount(0);
        setCoordsForPolylines([]);
        setPlanePosition(null);
        setDistance(0);
        setSelectNewRoute(false);
    }


    if (!isLoaded) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <Header/>
            <PageWrapper>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <p>Select places</p>

                    <ul className={styles.destinationsList}>
                        {Object.keys(destinations).map((destKey) => (
                            <li className={styles.destinationsList__item} key={destKey}>
                                <label>
                                    {destKey}
                                    <PlacesAutocomplete
                                        onAddressSelect={onAddressSelect}
                                        placeholder="Type place name"
                                        destKey={destKey}
                                    />
                                </label>

                            </li>
                        ))}
                    </ul>

                    <button className={styles.constructRoute} onClick={() => constructRoute(destinations)}>Construct route</button>

                    <button className={styles.showPaymentModal} onClick={showPaymentModal}>Show payment modal</button>

                    {selectNewRoute && <button onClick={clearSelections} className={styles.createNewRoute}>Select new route</button>}

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
                <InformationModal userEmail={email}
                                  userName={name}
                                  distance={distance}
                                  onClose={() => setShowModal(false)}
                                  movement={movement}
                                  destinations={destinations}
                />
            </Modal>}

            </PageWrapper>
        </>
    )
}

export default Map;
