import React, {useEffect, useRef, useState} from "react";
import '@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css';
import mapboxgl from "@neshan-maps-platform/mapbox-gl";
import { Marker } from "mapbox-gl";
import polyline from "@mapbox/polyline";
import SearchBar from "./SearchBar";

export type propType = {
}

const MapContainer = (props: propType) => {
    const [position, setPosition] = useState<[number, number]>([51.389, 35.6892]); // Default position
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                mapType: mapboxgl.Map.mapTypes.neshanVector,
                container: mapContainerRef.current,
                zoom: 12,
                pitch: 0,
                center: [51.392173, 35.730954],
                minZoom: 2,
                maxZoom: 21,
                trackResize: true,
                mapKey: "web.3d2b0719a70c49cc8b9261a18d4a4c72",
                poi: false,
                traffic: false,
            }) as unknown as mapboxgl.Map;
            mapRef.current.on("load", () => {
                handleClickOnMap();
            });
        }
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const {latitude, longitude} = pos.coords;
            setPosition([latitude, longitude]);
        });
    }, []);

    function handleClickOnMap() {
        const map = mapRef.current;
        if (map) {
            let marker: Marker;
            map.on("click", (e: mapboxgl.EventData) => {
                if (marker) {
                    marker.remove();
                }
                marker = new mapboxgl.Marker({color: "red"}).setLngLat(e.lngLat).addTo(map);
                setPosition([ e.lngLat.lng, e.lngLat.lat])
            });
        }
    }
    return <div
        ref={mapContainerRef}
        id="map"
        style={{width: "100%", height: "100vh"}}
    >
        <SearchBar map={mapRef} position={position}/>
    </div>
}

export default MapContainer;