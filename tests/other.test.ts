import { strictEqual } from "assert";

import { migrate } from "../scripts/helpers";
import { memOperationTestcase, nonOwnerTestcase } from "./helpers";
import { Tezos, signerAlice } from "./utils/cli";
import { Calculator } from "./calculator";
import initialStorage from "./storage/storage";

describe("Calculator other entrypoints test", function () {
  let aliceCalculator: Calculator;
  let bobCalculator: Calculator;

  beforeAll(async () => {
    try {
      Tezos.setSignerProvider(signerAlice);

      const deployedContract = await migrate(
        Tezos,
        "calculator",
        initialStorage,
        "sandbox"
      );

      aliceCalculator = await Calculator.init("alice", deployedContract);
      bobCalculator = await Calculator.init("bob", deployedContract);
    } catch (e) {
      console.log(e);
    }
  });

  describe("Testing entrypoint: Set_display", function () {
    it("Should set display_value to the specified one", async () => {
      await aliceCalculator.sendSingle(aliceCalculator.setDisplay(4));
      await aliceCalculator.updateStorage();
      strictEqual(aliceCalculator.storage.display_value.toNumber(), 4);
    });

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobCalculator.setDisplay(4))
    );
  });

  describe("Testing entrypoint: Add_memory", () => {
    it(
      "Should increase memory_value by 'memory_keyboard' value",
      async () => memOperationTestcase(
        aliceCalculator,
        "addMemory",
        [{ type: "memory_keyboard", value: 4 }],
        9,
        5
      )
    );

    it(
      "Should increase memory_value by 'display' value",
      async () => memOperationTestcase(
        aliceCalculator,
        "addMemory",
        [{ type: "memory_display" }],
        12,
        9,
        3
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobCalculator.addMemory({ type: "memory_keyboard", value: 4 }))
    );
  });

  describe("Testing entrypoint: Negate_memory", () => {
    it(
      "Should decrease memory_value by 'memory_keyboard' value",
      async () => memOperationTestcase(
        aliceCalculator,
        "negateMemory",
        [{ type: "memory_keyboard", value: 4 }],
        1,
        5
      )
    );

    it(
      "Should decrease memory_value by 'display' value",
      async () => memOperationTestcase(
        aliceCalculator,
        "negateMemory",
        [{ type: "memory_display" }],
        6,
        9,
        3
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobCalculator.negateMemory({ type: "memory_keyboard", value: 4 }))
    );
  });

  describe("Testing entrypoint: Reset_memory", () => {
    it(
      "Should reset memory_value to zero",
      async () => memOperationTestcase(aliceCalculator, "resetMemory", [], 0, 7)
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerTestcase(bobCalculator.resetMemory())
    );
  });
});
