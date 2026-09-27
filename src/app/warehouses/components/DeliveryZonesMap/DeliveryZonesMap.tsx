import { Layer, Map as MapMain, Marker, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapMouseEvent } from "mapbox-gl";
import { CustomMarker } from "@/shared/ui/mapbox/map-marker/CustomMarker";
import type { Sector } from "../DeliveryZone/DeliveryZone";

type Props = {
  sectors: Sector[];
  selectedSectorId: string | null;
  center: { lat: number; lng: number };
  mapToken: string;
  mapStyle: string;
  onClickSector: (id: string) => void;
};

export const DeliveryZonesMap = (props: Props) => {
  const data: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
    type: "FeatureCollection",
    features: props.sectors.map((sector) => ({
      type: "Feature",
      id: sector.id,
      properties: {
        id: sector.id,
        color: sector.color,
        price: sector.price,
        selected: sector.id === props.selectedSectorId,
      },
      geometry: sector.geometry,
    })),
  };

  const handleClickSector = (e: MapMouseEvent) => {
    const features = e.features;
    if (Array.isArray(features) && features.length > 0) {
      const firstLayer = features[0];
      if (firstLayer) {
        const id = firstLayer.properties?.id;
        if (id) {
          props.onClickSector(id);
        }
      }
    } else {
      props.onClickSector("");
    }
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
      interactiveLayerIds={["delivery-sectors-fill", "delivery-sectors-line"]}
      onClick={handleClickSector}
    >
      <Source id="delivery-sectors" type="geojson" data={data}>
        <Layer
          id="delivery-sectors-fill"
          type="fill"
          paint={{
            "fill-color": ["get", "color"],
            "fill-opacity": ["case", ["get", "selected"], 0.45, 0.25],
          }}
        />
        <Layer
          id="delivery-sectors-line"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": ["case", ["get", "selected"], 2, 1],
          }}
        />
      </Source>
      <Marker longitude={props.center.lng} latitude={props.center.lat} anchor="bottom">
        <CustomMarker type="pickup" size="md" active address="" />
      </Marker>
    </MapMain>
  );
};
