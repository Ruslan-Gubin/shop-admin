"use client";
import { type AddressItem, MapBox } from "@/shared/ui/mapbox/Mapbox";

type Props = {
  markers: AddressItem[];
  active: { lng: number; lat: number };
  mapToken: string;
  mapStyle: string;
  routeGeoJson: GeoJSON.LineString | null;
};

export const TransferMap = (props: Props) => {
  return (
    <MapBox
      initCenter={props.active}
      active={props.active}
      markers={props.markers}
      initZoom={12}
      mapboxAccessToken={props.mapToken}
      mapStyle={props.mapStyle}
      width="100%"
      height={500}
      hasFullScreen
      routeGeoJson={props.routeGeoJson}
    />
  );
};
