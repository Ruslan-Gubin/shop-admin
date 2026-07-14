import type { AddressItem, WayGeojsonResponse } from "@/shared/ui/mapbox/Mapbox";
import type { TransferModel } from "../../action";
import { TransferMap } from "../transfer-map/TransferMap";

type Props = {
  transfer: TransferModel;
  mapToken: string;
  mapStyle: string;
  fetchWayAction: (
    from_lng: number,
    from_lat: number,
    to_lng: number,
    to_lat: number,
    method: "driving" | "walking" | "cycling",
    mapToken: string,
  ) => Promise<WayGeojsonResponse>;
};

export const TransferMapWrapper = async (props: Props) => {
  const isDelivery = props.transfer.type === "delivery";

  const getTransferMarkers = (transfer: TransferModel) => {
    const markers: AddressItem[] = [];

    const fromAddress = transfer?.from_warehouse?.address;

    if (fromAddress?.lng && fromAddress?.lat) {
      markers.push(fromAddress);
    }

    if (isDelivery) {
      const toAddress = transfer?.to_address;
      if (toAddress?.lng && toAddress?.lat) {
        markers.push(toAddress);
      }
    } else {
      const toWarehouseAddress = transfer?.to_warehouse?.address;

      if (toWarehouseAddress?.lng && toWarehouseAddress.lat) {
        markers.push(toWarehouseAddress);
      }
    }

    return markers;
  };

  const markers = getTransferMarkers(props.transfer);

  const destinationAddress = isDelivery
    ? props.transfer?.to_address
    : props.transfer?.to_warehouse?.address;

  const center =
    destinationAddress?.lng && destinationAddress?.lat
      ? { lng: destinationAddress.lng, lat: destinationAddress.lat }
      : markers.length > 0
        ? { lng: markers[0].lng, lat: markers[0].lat }
        : { lng: 37.62, lat: 55.75 };

  const from = markers[0] ? { lng: markers[0].lng, lat: markers[0].lat } : null;
  const to = markers[1] ? { lng: markers[1].lng, lat: markers[1].lat } : null;

  const wayData: WayGeojsonResponse | null =
    from && to
      ? await props.fetchWayAction(from.lng, from.lat, to.lng, to.lat, "walking", props.mapToken)
      : null;

  return (
    <TransferMap
      active={center}
      mapStyle={props.mapStyle}
      mapToken={props.mapToken}
      markers={markers}
      routeGeoJson={
        wayData && wayData.routes.length > 0 && wayData.routes[0].geometry
          ? wayData.routes[0].geometry
          : null
      }
    />
  );
};
