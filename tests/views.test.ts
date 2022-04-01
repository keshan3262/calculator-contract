import { Tezos, signerAlice } from "./utils/cli";
import { migrate } from "../scripts/helpers";

import { ContractAbstraction, ContractProvider } from "@taquito/taquito";
import { strictEqual } from "assert";
import { getSettingInitialValuesTransfersParams } from "./helpers";
import { alice } from "../scripts/sandbox/accounts";
import { confirmOperation } from "../utils/confirmation";

describe("Calculator views test", function () {
  let contract;
  let chainId;

  beforeAll(async () => {
    try {
      Tezos.setSignerProvider(signerAlice);
      const storage = require("./storage/storage");

      const deployedContract = await migrate(
        Tezos,
        "calculator",
        storage,
        "sandbox"
      );
      contract = await Tezos.contract.at(deployedContract);
      chainId = await Tezos.rpc.getChainId();
    } catch (e) {
      console.log(e);
    }
  });

  describe("Testing view: Get_display", function () {
    it("Should return display_value", async () => {
      let batch = Tezos.wallet.batch();
      getSettingInitialValuesTransfersParams(contract, 1, 2)
        .forEach(transferParams => batch = batch.withTransfer(transferParams));
      const op = await batch.send();
      await confirmOperation(Tezos, op.opHash);

      const result = await (contract as ContractAbstraction<ContractProvider>).contractViews.get_display().executeView({
        viewCaller: alice.pkh
      });
      strictEqual(result.toNumber(), 1);
    });
  });
});
