import { migrate } from "../scripts/helpers";
import { initTezos } from "../utils/helpers";
import { Tezos, signerAlice } from "./utils/cli";
import { mathOperatorTestcase, nonOwnerMathOperatorTestcase } from "./helpers";

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

  describe("Testing entrypoint: Plus", function () {
    it("Should add two Keyboard_value values", async () => mathOperatorTestcase(
      aliceContract,
      "plus",
      [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }],
      16
    ));

    it("Should add Display_value to Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "plus",
      [{ type: "keyboard_value", value: 3 }, { type: "display_value" }],
      11,
      Tezos,
      8
    ));

    it("Should add Memory_value to Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "plus",
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
        "plus",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Minus", function () {
    it("Should negate one Keyboard_value from another one", async () => mathOperatorTestcase(
      aliceContract,
      "minus",
      [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }],
      -100
    ));

    it("Should negate Keyboard_value from Display_value", async () => mathOperatorTestcase(
      aliceContract,
      "minus",
      [{ type: "display_value" }, { type: "keyboard_value", value: 3 }],
      5,
      Tezos,
      8
    ));

    it("Should negate Memory_value from Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "minus",
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
        "minus",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Mul", function () {
    it("Should multiply two Keyboard_value values", async () => mathOperatorTestcase(
      aliceContract,
      "mul",
      [{ type: "keyboard_value", value: -7 }, { type: "keyboard_value", value: 8 }],
      -56
    ));

    it("Should multiply Display_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "mul",
      [{ type: "keyboard_value", value: 3 }, { type: "display_value" }],
      24,
      Tezos,
      8
    ));

    it("Should multiply Memory_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "mul",
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
        "mul",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Div", function () {
    it("Should throw div-by-zero error for zero divisor from Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "div",
      [{ type: "keyboard_value", value: 1 }, { type: "keyboard_value", value: 0 }],
      { error: "div-by-zero" }
    ));

    it("Should throw div-by-zero error for zero divisor from Display_value", async () => mathOperatorTestcase(
      aliceContract,
      "div",
      [{ type: "keyboard_value", value: 1 }, { type: "display_value" }],
      { error: "div-by-zero" },
      Tezos,
      0
    ));

    it("Should divide zero by non-zero value", async () => mathOperatorTestcase(
      aliceContract,
      "div",
      [{ type: "keyboard_value", value: 0 }, { type: "keyboard_value", value: 1 }],
      0
    ));

    it("Should divide a Keyboard_value by another one", async () => mathOperatorTestcase(
      aliceContract,
      "div",
      [{ type: "keyboard_value", value: 17 }, { type: "keyboard_value", value: 6 }],
      2
    ));

    it("Should divide Display_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "div",
      [{ type: "display_value" }, { type: "keyboard_value", value: 4 }],
      7,
      Tezos,
      28
    ));

    it("Should divide Memory_value by Keyboard_value", async () => mathOperatorTestcase(
      aliceContract,
      "div",
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
        "div",
        [{ type: "keyboard_value", value: -42 }, { type: "keyboard_value", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Sqrt", function () {
    it(
      "Should throw sqrt-of-negative error for negative Keyboard_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "sqrt",
        [{ type: "keyboard_value", value: -1 }],
        { error: "sqrt-of-negative" }
      )
    );

    it(
      "Should throw sqrt-of-negative error for negative Display_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "sqrt",
        [{ type: "display_value" }],
        { error: "sqrt-of-negative" },
        Tezos,
        -1,
        0
      )
    );

    it(
      "Should throw sqrt-of-negative error for negative Memory_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "sqrt",
        [{ type: "memory_value" }],
        { error: "sqrt-of-negative" },
        Tezos,
        0,
        -1
      )
    );

    it(
      "Should return zero for 0",
      async () => mathOperatorTestcase(
        aliceContract,
        "sqrt",
        [{ type: "keyboard_value", value: 0 }],
        0
      )
    );

    it(
      "Should calculate square root of Display_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "sqrt",
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
        "sqrt",
        [{ type: "keyboard_value", value: "2838143136774604646417234884035774" }],
        "53274225820509157"
      )
    );

    it(
      "Should calculate square root of Memory_value",
      async () => mathOperatorTestcase(
        aliceContract,
        "sqrt",
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
        "sqrt",
        [{ type: "keyboard_value", value: 64 }],
        8
      )
    );

    it(
      "Should return 5 for 32",
      async () => mathOperatorTestcase(
        aliceContract,
        "sqrt",
        [{ type: "keyboard_value", value: 32 }],
        5
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobContract,
        "sqrt",
        [{ type: "keyboard_value", value: -42 }]
      )
    );
  });
});
