import {ICoord, IDestinations} from "@/types/map";


interface IProps {
    setPlanePosition: (value: ICoord | null) => void;
    destinations: IDestinations;
    rotatePlane: (point1LatLng: google.maps.LatLng, point2LatLng: google.maps.LatLng) => void;
    pointALatLng: google.maps.LatLng | undefined;
    pointBLatLng: google.maps.LatLng | undefined;
    pointCLatLng: google.maps.LatLng | undefined;
    setSelectNewRoute: (value: boolean) => void;
}


const numDeltas = 100;
let delay = 10; //milliseconds
let i = 0;
let deltaLat: number;
let deltaLng: number;
let isLast: boolean;

const useMoveMarker = ({
                           setPlanePosition,
                           destinations,
                           rotatePlane,
                           pointALatLng,
                           pointBLatLng,
                           pointCLatLng,
                           setSelectNewRoute
                       }: IProps) => {
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

    const movement = async () => {
        await moveMarkerFromAtoB();
    };

    const moveMarker = (initialLat: number, initialLng: number) => {
        if (i === numDeltas && isLast) {

            setSelectNewRoute(true);

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
        setTimeout(() => moveMarker(initialLat, initialLng), delay)

    };

    return {
        movement
    }
};

export default useMoveMarker;