import { Tezos, signerAlice } from "./utils/cli";
import { migrate } from '../scripts/helpers';
import { UnitValue } from '@taquito/taquito';
import { strictEqual } from 'assert';

describe("Calculator test", function () {
  let contract;

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
    } catch (e) {
      console.log(e);
    }
  });

  describe("Testing entrypoint: Set", function () {
    it("Should set display_value to the specified one", async function () {
      const op = await contract.methods.set(4).send();
      await op.confirmation();
      const storage = await contract.storage();
      strictEqual(storage.display_value.toNumber(), 4);
    });
  });

  describe("Testing entrypoint: Plus", function () {
    it("Should add two Keyboard_value values", async function () {
      const op = await contract.methods.plus("keyboard_value", -42, "keyboard_value", 58).send();
      await op.confirmation();
      const storage = await contract.storage();
      strictEqual(storage.display_value.toNumber(), 16);
    });

    it("Should add Display_value to Keyboard_value", async function () {
      const batch = await Tezos.wallet.batch()
        .withTransfer(contract.methods.set(8).toTransferParams())
        .withTransfer(contract.methods.plus("keyboard_value", 3, "display_value", UnitValue).toTransferParams());
      const op = await batch.send();
      await op.confirmation();
      const storage = await contract.storage();
      strictEqual(storage.display_value.toNumber(), 11);
    });
  });
});
