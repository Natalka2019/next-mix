import {useState} from "react";
import {ICoord, IDestinations} from "@/types/map";


const createGoogleLatLngObject = (lat: number | undefined, lng: number | undefined) => {
    if (lat && lng) {
        return new window.google.maps.LatLng(lat, lng)
    }
};
const useConstructRoute = () => {
    const [coordsForPolylines, setCoordsForPolylines] = useState<ICoord[]>([]);
    const [planePosition, setPlanePosition] = useState<ICoord | null>(null);
    const [pointALatLng, setPointALatLng] = useState<google.maps.LatLng>();
    const [pointBLatLng, setPointBLatLng] = useState<google.maps.LatLng>();
    const [pointCLatLng, setPointCLatLng] = useState<google.maps.LatLng>();
    const constructRoute = (destinations: IDestinations) => {
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

    return {
        constructRoute,
        coordsForPolylines,
        planePosition,
        pointALatLng,
        pointBLatLng,
        pointCLatLng,
        setPlanePosition,
        setCoordsForPolylines
    }
};

export default useConstructRoute;