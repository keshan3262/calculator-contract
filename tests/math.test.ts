import { migrate } from "../scripts/helpers";
import { initTezos } from "../utils/helpers";
import { Tezos, signerAlice } from "./utils/cli";
import { mathOperatorTestcase, nonOwnerMathOperatorTestcase } from "./helpers";

describe("Calculator math entrypoints test", function () {
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

  describe("Testing entrypoint: Add", function () {
    it("Should add two Keyboard_value values", async () => mathOperatorTestcase(
      aliceContract,
      "add",
      [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }],
      16
    ));

    it("Should add Display_value to Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "add",
      [{ type: "keyboard_value", value: 3 }, { type: "display_value" }],
      11,
      Tezos,
      8
    ));

    it("Should add Memory_value to Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "add",
      [{ type: "keyboard_value", value: 3 }, { type: "memory_value" }],
      12,
      Tezos,
      1,
      9
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobContract,
        "add",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Negate", function () {
    it("Should negate second Keyboard_value from thr first one", async () => mathOperatorTestcase(
      aliceContract,
      "negate",
      [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }],
      -100
    ));

    it("Should negate Keyboard_value from Display_value", async () => mathOperatorTestcase(
      aliceContract,
      "negate",
      [{ type: "display_value" }, { type: "keyboard_value", value: 3 }],
      5,
      Tezos,
      8
    ));

    it("Should negate Memory_value from Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "negate",
      [{ type: "keyboard_value", value: 3 }, { type: "memory_value" }],
      -6,
      Tezos,
      1,
      9
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobContract,
        "negate",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Multiply", function () {
    it("Should multiply two Keyboard_value values", async () => mathOperatorTestcase(
      aliceContract,
      "multiply",
      [{ type: "keyboard_value", value: -7 }, { type: "keyboard_value", value: 8 }],
      -56
    ));

    it("Should multiply Display_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "multiply",
      [{ type: "keyboard_value", value: 3 }, { type: "display_value" }],
      24,
      Tezos,
      8
    ));

    it("Should multiply Memory_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "multiply",
      [{ type: "keyboard_value", value: 3 }, { type: "memory_value" }],
      27,
      Tezos,
      2,
      9
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobContract,
        "multiply",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Divide", function () {
    it("Should divide zero by non-zero value", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "keyboard_value", value: 0 }, { type: "keyboard_value", value: 1 }],
      0
    ));

    it("Should divide a Keyboard_value by another one", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "keyboard_value", value: 17 }, { type: "keyboard_value", value: 6 }],
      2
    ));

    it("Should divide Display_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "display_value" }, { type: "keyboard_value", value: 4 }],
      7,
      Tezos,
      28
    ));

    it("Should divide Memory_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "memory_value" }, { type: "keyboard_value", value: 3 }],
      9,
      Tezos,
      2,
      27
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobContract,
        "divide",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Write_sqrt", function () {
    it(
      "Should throw Calculator/value-negative error for negative Keyboard_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard_value", value: -1 }],
        { error: "Calculator/value-negative" }
      )
    );

    it(
      "Should throw Calculator/value-negative error for negative Display_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "display_value" }],
        { error: "Calculator/value-negative" },
        Tezos,
        -1,
        0
      )
    );

    it(
      "Should throw Calculator/value-negative error for negative Memory_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "memory_value" }],
        { error: "Calculator/value-negative" },
        Tezos,
        0,
        -1
      )
    );

    it(
      "Should return zero for 0",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard_value", value: 0 }],
        0
      )
    );

    it(
      "Should return 1 for 1",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard_value", value: 1 }],
        1
      )
    );

    it(
      "Should calculate square root of Display_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "display_value" }],
        "94052897529346117",
        Tezos,
        "8845947533665681022193720685353968"
      )
    );

    it(
      "Should calculate square root of Keyboard_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard_value", value: "2838143136774604646417234884035774" }],
        "53274225820509157"
      )
    );

    it(
      "Should calculate square root of Memory_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "memory_value" }],
        "982713752979381",
        Tezos,
        undefined,
        "965726320294821369094524117013"
      )
    );

    it(
      "Should return 8 for 64",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard_value", value: 64 }],
        8
      )
    );

    it(
      "Should return 5 for 32",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard_value", value: 32 }],
        5
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobContract,
        "write_sqrt",
        [{ type: "keyboard_value", value: -42 }]
      )
    );
  });
});
