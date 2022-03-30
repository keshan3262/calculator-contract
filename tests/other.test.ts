import { Tezos, signerAlice } from "./utils/cli";
import { migrate } from "../scripts/helpers";
import { initTezos } from "../utils/helpers";

import { UnitValue } from "@taquito/taquito";
import { strictEqual } from "assert";
import { memOperationTestcase, nonOwnerTestcase } from "./helpers";

describe("Calculator other entrypoints test", function () {
  let aliceContract;
  let bobContract;
  let bobTezos;

  beforeAll(async () => {
    try {
      bobTezos = await initTezos("bob");
      Tezos.setSignerProvider(signerAlice);
      const storage = require("./storage/storage");

      const deployedContract = await migrate(
        Tezos,
        "calculator",
        storage,
        "sandbox"
      );
      aliceContract = await Tezos.contract.at(deployedContract);
      bobContract = await bobTezos.contract.at(deployedContract);
    } catch (e) {
      console.log(e);
    }
  });

  describe("Testing entrypoint: Set_display", function () {
    it("Should set display_value to the specified one", async () => {
      const op = await aliceContract.methods.set_display(4).send();
      await op.confirmation();
      const storage = await aliceContract.storage();
      strictEqual(storage.display_value.toNumber(), 4);
    });

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "set_display", [4])
    );
  });

  describe("Testing entrypoint: Add_memory", () => {
    it(
      "Should increase memory_value by 'memory_keyboard' value",
      async () => memOperationTestcase(
        aliceContract,
        "add_memory",
        ["memory_keyboard", 4],
        9,
        5
      )
    );

    it(
      "Should increase memory_value by 'display' value",
      async () => memOperationTestcase(
        aliceContract,
        "add_memory",
        ["memory_display", UnitValue],
        12,
        9,
        3
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "add_memory", ["memory_keyboard", 4])
    );
  });

  describe("Testing entrypoint: Negate_memory", () => {
    it(
      "Should decrease memory_value by 'memory_keyboard' value",
      async () => memOperationTestcase(
        aliceContract,
        "negate_memory",
        ["memory_keyboard", 4],
        1,
        5
      )
    );

    it(
      "Should decrease memory_value by 'display' value",
      async () => memOperationTestcase(
        aliceContract,
        "negate_memory",
        ["memory_display"],
        6,
        9,
        3
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "negate_memory", ["memory_keyboard", 4])
    );
  });

  describe("Testing entrypoint: Reset_memory", () => {
    it(
      "Should reset memory_value to zero",
      async () => memOperationTestcase(aliceContract, "reset_memory", [], 0, 7)
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "reset_memory", [UnitValue])
    );
  });
});
