import {useState} from "react";
import {ICoord, IDestinations} from "@/types/map";


interface IProps {
    setPlanePosition: (value: ICoord | null) => void;
    setPointALatLng: (value: google.maps.LatLng | undefined) => void;
    setPointBLatLng: (value: google.maps.LatLng | undefined) => void;
    setPointCLatLng: (value: google.maps.LatLng | undefined) => void;
}

const createGoogleLatLngObject = (lat: number | undefined, lng: number | undefined) => {
    if (lat && lng) {
        return new window.google.maps.LatLng(lat, lng)
    }
};
const useConstructRoute = ({
                               setPlanePosition,
                               setPointALatLng,
                               setPointBLatLng,
                               setPointCLatLng
                           }: IProps) => {
    const [coordsForPolylines, setCoordsForPolylines] = useState<ICoord[]>([]);
    // const [pointALatLng, setPointALatLng] = useState<google.maps.LatLng>();
    // const [pointBLatLng, setPointBLatLng] = useState<google.maps.LatLng>();
    // const [pointCLatLng, setPointCLatLng] = useState<google.maps.LatLng>();
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
        setPlanePosition,
        setCoordsForPolylines
    }
};

export default useConstructRoute;