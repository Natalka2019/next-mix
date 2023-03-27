export interface IDestination {
    lat: number;
    lng: number;
}

export interface IDestinations {
    A: IDestination | null;
    B: IDestination | null;
    C: IDestination | null;
}

export interface ICoord {
    lat: number;
    lng: number;
}
