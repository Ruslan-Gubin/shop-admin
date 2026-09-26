import { Layer, Map as MapMain, Marker, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { CustomMarker } from "@/shared/ui/mapbox/map-marker/CustomMarker";
import type { Sector } from "./DeliveryZone";

type Props = {
  sectors: Sector[];
  center: { lat: number; lng: number };
  mapToken: string;
  mapStyle: string;
};

export const DeliveryZonesMap = (props: Props) => {
  const data: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
    type: "FeatureCollection",
    features: props.sectors.map((sector) => ({
      type: "Feature",
      id: sector.id,
      properties: { color: sector.color, price: sector.price },
      geometry: sector.geometry,
    })),
  };

  return (
    <MapMain
      language="ru"
      mapboxAccessToken={props.mapToken}
      mapStyle={props.mapStyle}
      initialViewState={{
        longitude: props.center.lng,
        latitude: props.center.lat,
        zoom: 14,
      }}
      style={{ width: "100%", height: "100%" }}
      pitch={0}
      bearing={0}
    >
      <Marker longitude={props.center.lng} latitude={props.center.lat} anchor="bottom">
        <CustomMarker type="pickup" size="md" active address="" />
      </Marker>
      <Source id="delivery-sectors" type="geojson" data={data}>
        <Layer
          id="delivery-sectors-fill"
          type="fill"
          paint={{
            "fill-color": ["get", "color"],
            "fill-opacity": 0.25,
          }}
        />
        <Layer
          id="delivery-sectors-line"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": 2,
          }}
        />
      </Source>
    </MapMain>
  );
};
