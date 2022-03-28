import { Tezos, signerAlice } from "./utils/cli";
import { migrate } from "../scripts/helpers";
import { initTezos } from "../utils/helpers";

import { UnitValue } from "@taquito/taquito";
import { strictEqual } from "assert";
import { memOperationTestcase, nonOwnerTestcase } from "./helpers";

describe("Calculator test", function () {
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

  describe("Testing entrypoint: Set", function () {
    it("Should set display_value to the specified one", async () => {
      const op = await aliceContract.methods.set(4).send();
      await op.confirmation();
      const storage = await aliceContract.storage();
      strictEqual(storage.display_value.toNumber(), 4);
    });

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "set", [4])
    );
  });

  describe("Testing entrypoint: Mem_plus", () => {
    it(
      "Should increase memory_value by Mem_plus_keyboard_value value",
      async () => memOperationTestcase(
        aliceContract,
        "mem_plus",
        ["mem_plus_keyboard_value", 4],
        9,
        5
      )
    );

    it(
      "Should increase memory_value by display value",
      async () => memOperationTestcase(
        aliceContract,
        "mem_plus",
        ["mem_plus_display_value", UnitValue],
        12,
        9,
        3
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "mem_plus", ["mem_plus_keyboard_value", 4])
    );
  });

  describe("Testing entrypoint: Mem_minus", () => {
    it(
      "Should decrease memory_value by Mem_minus_keyboard_value value",
      async () => memOperationTestcase(
        aliceContract,
        "mem_minus",
        ["mem_minus_keyboard_value", 4],
        1,
        5
      )
    );

    it(
      "Should decrease memory_value by display value",
      async () => memOperationTestcase(
        aliceContract,
        "mem_minus",
        ["mem_minus_display_value"],
        6,
        9,
        3
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "mem_minus", ["mem_minus_keyboard_value", 4])
    );
  });

  describe("Testing entrypoint: Mem_clear", () => {
    it(
      "Should reset memory_value to zero",
      async () => memOperationTestcase(aliceContract, "mem_clear", [], 0, 7)
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobContract, "mem_clear", [UnitValue])
    );
  });
});
