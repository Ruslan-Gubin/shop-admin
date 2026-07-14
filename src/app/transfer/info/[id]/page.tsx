import { TransferInfo } from "@/app/transfer/components/transfer-info/TransferInfo";
import { CONFIG_APP } from "@/shared/config/config";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { TransferMapWrapper } from "../../components/transfer-map-wrapper/TransferMapWrapper";
import { fetchTransferData, fetchWayAction } from "./action";

export default async function TransferInfoPage(req: { params: Promise<{ id: string }> }) {
  const params = await req.params;
  const { transferData, productsData } = await fetchTransferData(params.id);

  return (
    <section className="page-wrapper">
      <h2>Информация о перемещении</h2>
      {productsData?.tokens && <UpdateToken tokens={productsData.tokens} />}
      {transferData.status === "error" && transferData.message && (
        <ErrorAlert message={transferData.message} />
      )}
      {productsData.status === "error" && productsData.message && (
        <ErrorAlert message={productsData.message} />
      )}
      {transferData.data && (
        <TransferInfo transfer={transferData.data} products={productsData.data || []} />
      )}
      {transferData.data && CONFIG_APP.MAPBOX_ACCESS_TOKEN && CONFIG_APP.MAPBOX_STYLE && (
        <TransferMapWrapper
          fetchWayAction={fetchWayAction}
          transfer={transferData.data}
          mapToken={CONFIG_APP.MAPBOX_ACCESS_TOKEN}
          mapStyle={CONFIG_APP.MAPBOX_STYLE}
        />
      )}
    </section>
  );
}
