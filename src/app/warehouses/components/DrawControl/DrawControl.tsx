import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useRef } from "react";
import { type ControlPosition, useControl } from "react-map-gl/mapbox";

export type DrawEventFeature = GeoJSON.Feature<GeoJSON.Polygon> & { id: string };

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  onCreate: (evt: { features: DrawEventFeature[]; action: string }) => void;
  onUpdate: (evt: { features: DrawEventFeature[]; action: string }) => void;
  onDelete?: (evt: { features: DrawEventFeature[] }) => void;
  initialFeature?: DrawEventFeature;
};

export const DrawControl = (props: DrawControlProps) => {
  const drawRef = useRef<MapboxDraw | null>(null);

  useControl<MapboxDraw>(
    () => {
      const instance = new MapboxDraw(props);
      drawRef.current = instance;
      return instance;
    },
    ({ map }) => {
      const draw = drawRef.current;

      if (draw && props.initialFeature) {
        draw.set({ type: "FeatureCollection", features: [props.initialFeature] });
        draw.changeMode("direct_select", { featureId: props.initialFeature.id });
      }

      map.on("draw.create", props.onCreate);
      map.on("draw.update", props.onUpdate);
      if (props.onDelete) {
        map.on("draw.delete", props.onDelete);
      }
    },
    ({ map }) => {
      map.off("draw.create", props.onCreate);
      map.off("draw.update", props.onUpdate);
      if (props.onDelete) {
        map.off("draw.delete", props.onDelete);
      }
    },
    { position: props.position },
  );

  return null;
};
