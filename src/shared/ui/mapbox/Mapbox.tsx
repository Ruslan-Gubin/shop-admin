import { useEffect, useMemo, useRef, useState } from "react";
import {
  FullscreenControl,
  GeolocateControl,
  Layer,
  Map as MapMain,
  type MapMouseEvent,
  type MapRef,
  Marker,
  type MarkerEvent,
  NavigationControl,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { CustomMarker } from "./map-marker/CustomMarker";

export type AddressItem = {
  type: "pickup" | "courier";
  name: string;
  place: string;
  lng: number;
  lat: number;
  entrance: string;
  flat: string;
  floor: string;
  intercom: string;
};

export type WayGeojsonResponse = {
  code: string;
  routes: {
    distance: number;
    duration: number;
    geometry: { type: "LineString"; coordinates: [number, number][] };
    legs: {
      admins: {
        iso_3166_1: string;
        iso_3166_1_alpha3: string;
        distance: number;
        duration: number;
        steps: [];
        summary: string;
        via_waypoints: [];
        weight: number;
      }[];
    }[];
    weight: number;
    weight_name: string;
  }[];
  uuid: string;
  waypoints: {
    location: [number, number];
    name: string;
    distance: number;
  }[];
};

export type MapBoxFeaturesItem = {
  id: string;
  geometry: { type: string; coordinates: number[] };
  properties: {
    context: {
      address: {
        address_number: string;
        mapbox_id: string;
        name: string;
        street_name: string;
      };
      country: {
        country_code: string;
        country_code_alpha_3: string;
        mapbox_id: string;
        name: string;
        translations: {
          ru: {
            language: string;
            name: string;
          };
        };
        wikidata_id: string;
      };
      place: {
        mapbox_id: string;
        name: string;

        translations: {
          ru: {
            language: string;
            name: string;
          };
        };
        wikidata_id: string;
      };
      postcode: {
        mapbox_id: string;
        name: string;
      };
      region: {
        mapbox_id: string;
        name: string;
        region_code: string;
        region_code_full: string;
        translations: {
          ru: {
            language: string;
            name: string;
          };
        };
        wikidata_id: string;
      };
      street: {
        mapbox_id: string;
        name: string;
      };
    };
    coordinates: {
      accuracy: string;
      latitude: number;
      longitude: number;
    };
    routable_points: {
      latitude: number;
      longitude: number;
      name: string;
    }[];
    mapbox_id: string;
    feature_type: string;
    full_address: string;
    name: string;
    name_preferred: string;
    place_formatted: string;
  };
  type: string;
};

export type MapBoxGetSearchGeocodeResponse = {
  attribution: string;
  type: string;
  features: MapBoxFeaturesItem[];
};

type Props = {
  initCenter: { lat: number; lng: number };
  active: { lng: number; lat: number };
  markers: AddressItem[];
  initZoom: number;
  mapboxAccessToken: string;
  mapStyle: string;
  width: number | string;
  height: number | string;
  onClickMarker?: (lng: number, lat: number) => void;
  onClickMap?: (lng: number, lat: number) => void;
  hasFullScreen?: boolean;
  routeGeoJson?: GeoJSON.LineString | null;
};

export const MapBox = (props: Props) => {
  const [mapZoom, setMapZoom] = useState<"sm" | "md" | "lg">("md");
  const [mapLoad, setMapLoad] = useState<boolean>(false);
  const mapRef = useRef<MapRef | null>(null);

  const handleClickMap = (e: MapMouseEvent) => {
    const map = e.target;
    const currentZoom = map.getZoom();

    map.flyTo({
      center: [e.lngLat.lng, e.lngLat.lat],
      zoom: currentZoom < props.initZoom ? props.initZoom : currentZoom,
    });

    if (props.onClickMap) {
      props.onClickMap(e.lngLat.lng, e.lngLat.lat);
    }
  };

  const handleClickMarker = (e: MarkerEvent<MouseEvent>) => {
    if (mapRef.current && typeof props.onClickMarker === "function") {
      e.originalEvent.stopPropagation();
      props.onClickMarker(e.target._lngLat.lng, e.target._lngLat.lat);
    }
  };

  const handleChangeZoom = (e: ViewStateChangeEvent) => {
    const zoom = e.viewState.zoom;
    let changeZoom: "sm" | "md" | "lg" | "" = "";

    if (zoom < 14 && mapZoom !== "sm") {
      changeZoom = "sm";
    } else if (zoom > 14 && zoom < 17 && mapZoom !== "md") {
      changeZoom = "md";
    } else if (zoom > 17 && mapZoom !== "lg") {
      changeZoom = "lg";
    }

    if (changeZoom) {
      setMapZoom(changeZoom);
    }
  };

  useEffect(() => {
    if (props.active.lng && props.active.lat && mapRef.current) {
      const currentZoom = mapRef.current.getZoom();

      mapRef.current.flyTo({
        center: [props.active.lng, props.active.lat],
        zoom: currentZoom < props.initZoom ? props.initZoom : currentZoom,
      });
    }
  }, [props.active, props.initZoom]);

  useEffect(() => {
    return () => {
      setMapLoad(false);
    };
  }, []);

  const sortedMarkers = useMemo(() => {
    const result = [];

    let lastMarkerIndex: number | null = null;

    for (let i = 0; i < props.markers.length; i++) {
      const marker = props.markers[i];
      if (marker.lng === props.active.lng && marker.lat === props.active.lat) {
        lastMarkerIndex = i;
      } else {
        result.push(marker);
      }
    }

    if (typeof lastMarkerIndex === "number") {
      result.push(props.markers[lastMarkerIndex]);
    }

    return result;
  }, [props.markers, props.active]);

  return (
    <MapMain
      onLoad={() => setMapLoad(true)}
      onZoom={handleChangeZoom}
      language="ru"
      onClick={handleClickMap}
      ref={mapRef}
      mapboxAccessToken={props.mapboxAccessToken}
      initialViewState={{
        latitude: props.initCenter.lat,
        longitude: props.initCenter.lng,
        zoom: props.initZoom,
      }}
      style={{ width: props.width, height: props.height }}
      mapStyle={props.mapStyle}
      pitch={0}
      bearing={0}
    >
      <GeolocateControl position="top-left" />
      <NavigationControl position="top-left" />
      {props.hasFullScreen && <FullscreenControl containerId="1" position="top-right" />}
      {mapLoad &&
        sortedMarkers.length > 0 &&
        sortedMarkers.map((marker) => (
          <Marker
            key={`${marker.lng}_${marker.lat}_${marker.type}_${marker.name}`}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
            onClick={handleClickMarker}
          >
            <CustomMarker
              active={marker.lng === props.active.lng && marker.lat === props.active.lat}
              size={mapZoom}
              type={marker.type}
              address={marker.name}
            />
          </Marker>
        ))}
      {props.routeGeoJson && (
        <Source id="route" type="geojson" data={props.routeGeoJson}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              "line-color": "#f1117e",
              "line-width": 4,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}
    </MapMain>
  );
};
