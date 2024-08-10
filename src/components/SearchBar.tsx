import React, {useEffect, useRef, useState} from "react"
import axios from "axios";
import mapboxgl from "@neshan-maps-platform/mapbox-gl";
import {Marker} from "mapbox-gl";
import {ISearchItem} from "../interface/SearchItem.interface";
import polyline from "@mapbox/polyline";
import searchIcon from "../assets/search.svg"
export type propType = {
    map: React.MutableRefObject<mapboxgl.Map | null>;
    position: [number, number];
}
const SearchBar = (props: propType) => {
    const {map, position} = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchCount, setSearchCount] = useState(0);
    const [info, setInfo] = useState<ISearchItem[]>([]);
    let searchMarkers: Marker[] = [];

    const search = () => {
        const term = inputRef.current?.value;
        const url = `https://api.neshan.org/v1/search?term=${term}&lat=${map.current?.getCenter().lat}&lng=${map.current?.getCenter().lng}`;
        const params = {
            headers: {
                'Api-Key': 'service.489249d47d774c78a571e7473f733767'
            },

        };
        axios.get(url, params)
            .then(data => {
                if (data.data.count != 0) {
                } else {
                    // document.getElementById("panel").style = "height: fit-content;"
                }
                setSearchCount(data.data.count);
                if(searchMarkers.length > 0 ){
                    for (let i = searchMarkers.length - 1; i >= 0; i--) {
                        searchMarkers[i].remove();
                    }
                }
                setInfo(data.data.items);
                for (let i = 0; i < data.data.count; i++) {
                        searchMarkers[i] = new mapboxgl.Marker()
                            .setLngLat([data.data.items[i]?.location.x, data.data.items[i]?.location.y])
                            .addTo(map?.current!);
                    }
            }).catch(error => {
            console.log(error.response);
        });
    }
    const findDirection = (destLat: number, destLng: number) => {
        const url =
            `https://api.neshan.org/v4/direction?type=car&origin=
            ${position[1]}%2C${position[0]}&destination=${destLng}%2C${destLat}`;
        const params = {
            headers: {
                'Api-Key': 'service.489249d47d774c78a571e7473f733767'
            },
        };
        axios.get(url, params)
            .then(data => {
                if (data.data.routes.count !== 0) {
                    addRouteToMap(data.data)
                } else {
                    // document.getElementById("panel").style = "height: fit-content;"
                }
            }).catch(error => {
            console.log(error.response);
        });
    }

    function addRouteToMap(direction: { routes: string | any[]; }) {

        const routes: [number, number][][] = [];
        const points: number[][] = [];
        console.log(map?.current!.getSource("route"))
        if(map?.current!.getSource("route")) {
            console.log("sdf")
            map?.current!.removeLayer("route")
            map?.current!.removeLayer("route-line")
            map?.current!.removeSource("route");
        }
        for (let k = 0; k < direction.routes.length; k++) {
            for (let j = 0; j < direction.routes[k].legs.length; j++) {
                for (
                    let i = 0;
                    i < direction.routes[k].legs[j].steps.length;
                    i++
                ) {
                    const step = direction.routes[k].legs[j].steps[i]["polyline"];
                    const point =
                        direction.routes[k].legs[j].steps[i]["start_location"];

                    const route = polyline.decode(step, 5);

                    route.map((item: number[]) => {
                        item.reverse();
                    });

                    routes.push(route);
                    points.push(point);
                }
            }
        }
            map?.current!.addSource("route", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "MultiLineString",
                                coordinates: routes,
                            },
                            properties: null,
                        },
                    ],
                },
            });
            map?.current!.removeLayer("route");
            map?.current!.removeLayer("route-line");
            map?.current!.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#250ECD",
                    "line-width": 9,
                },
            });

            map?.current!.addLayer({
                id: "route-line",
                type: "circle",
                source: "route",
                paint: {
                    "circle-color": "#9fbef9",
                    "circle-stroke-color": "#FFFFFF",
                    "circle-stroke-width": 2,
                    "circle-radius": 5,
                },
            });
    }

    return (
        <div className="search-container"
             style={{height: searchCount === 0 ? "60px" : "100vh", background: searchCount === 0 ? "none" : "#f5f5f5"}}>
            <div className="search-box" >
                <input  ref={inputRef} placeholder="جستجو"/>
                <div onClick={search} style={{padding: "5px 0 0 5px"}}><img src={searchIcon} alt="search" width="20"/></div>
            </div>
            <div className="search-items">
                {info && info.map((inf, index) => (
                    <div className="search-item" key={index}
                         onClick={() => findDirection(inf.location.x, inf.location.y)}>
                        <h2>
                            {inf?.title}
                        </h2>
                        <h4>
                            {inf?.type === "restaurant" ? "رستوران" : inf?.type}
                        </h4>
                        <h4>
                            {inf?.address}
                        </h4>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default SearchBar