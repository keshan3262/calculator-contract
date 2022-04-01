import { migrate } from "../scripts/helpers";
import { Tezos, signerAlice } from "./utils/cli";
import { mathOperatorTestcase, nonOwnerMathOperatorTestcase } from "./helpers";
import { Calculator } from "./calculator";
import initialStorage from "./storage/storage";

describe("Calculator math entrypoints test", function () {
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

  describe("Testing entrypoint: Add", function () {
    it("Should add two 'keyboard' values", async () => mathOperatorTestcase(
      aliceCalculator,
      "add",
      [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }],
      16
    ));

    it("Should add 'display' value to 'keyboard' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "add",
      [{ type: "keyboard", value: 3 }, { type: "display" }],
      11,
      8
    ));

    it("Should add 'memory' value to 'keyboard' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "add",
      [{ type: "keyboard", value: 3 }, { type: "memory" }],
      12,
      1,
      9
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobCalculator,
        "add",
        { type: "keyboard", value: -42 },
        { type: "keyboard", value: 58 }
      )
    );
  });

  describe("Testing entrypoint: Negate", function () {
    it("Should negate second 'keyboard' value from thr first one", async () => mathOperatorTestcase(
      aliceCalculator,
      "negate",
      [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }],
      -100
    ));

    it("Should negate 'keyboard' value from 'display' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "negate",
      [{ type: "display" }, { type: "keyboard", value: 3 }],
      5,
      8
    ));

    it("Should negate 'memory' value from 'keyboard' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "negate",
      [{ type: "keyboard", value: 3 }, { type: "memory" }],
      -6,
      1,
      9
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobCalculator,
        "negate",
        { type: "keyboard", value: -42 },
        { type: "keyboard", value: 58 }
      )
    );
  });

  describe("Testing entrypoint: Multiply", function () {
    it("Should multiply two 'keyboard' values", async () => mathOperatorTestcase(
      aliceCalculator,
      "multiply",
      [{ type: "keyboard", value: -7 }, { type: "keyboard", value: 8 }],
      -56
    ));

    it("Should multiply 'display' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "multiply",
      [{ type: "keyboard", value: 3 }, { type: "display" }],
      24,
      8
    ));

    it("Should multiply 'memory' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "multiply",
      [{ type: "keyboard", value: 3 }, { type: "memory" }],
      27,
      2,
      9
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobCalculator,
        "multiply",
        { type: "keyboard", value: -42 },
        { type: "keyboard", value: 58 }
      )
    );
  });

  describe("Testing entrypoint: Divide", function () {
    it("Should divide zero by non-zero value", async () => mathOperatorTestcase(
      aliceCalculator,
      "divide",
      [{ type: "keyboard", value: 0 }, { type: "keyboard", value: 1 }],
      0
    ));

    it("Should divide a 'keyboard' value by another one", async () => mathOperatorTestcase(
      aliceCalculator,
      "divide",
      [{ type: "keyboard", value: 17 }, { type: "keyboard", value: 6 }],
      2
    ));

    it("Should divide 'display' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "divide",
      [{ type: "display" }, { type: "keyboard", value: 4 }],
      7,
      28
    ));

    it("Should divide 'memory' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceCalculator,
      "divide",
      [{ type: "memory" }, { type: "keyboard", value: 3 }],
      9,
      2,
      27
    ));

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobCalculator,
        "divide",
        { type: "keyboard", value: -42 },
        { type: "keyboard", value: 58 }
      )
    );
  });

  describe("Testing entrypoint: writeSqrt", function () {
    it(
      "Should throw Calculator/value-negative error for negative 'keyboard' value",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "keyboard", value: -1 }],
        { error: "Calculator/value-negative" }
      )
    );

    it(
      "Should throw Calculator/value-negative error for negative 'display' value",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "display" }],
        { error: "Calculator/value-negative" },
        -1,
        0
      )
    );

    it(
      "Should throw Calculator/value-negative error for negative 'memory' value",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "memory" }],
        { error: "Calculator/value-negative" },
        0,
        -1
      )
    );

    it(
      "Should return zero for 0",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "keyboard", value: 0 }],
        0
      )
    );

    it(
      "Should return 1 for 1",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "keyboard", value: 1 }],
        1
      )
    );

    it(
      "Should calculate square root of 'display' value",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "display" }],
        "94052897529346117",
        "8845947533665681022193720685353968"
      )
    );

    it(
      "Should calculate square root of 'keyboard' value",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "keyboard", value: "2838143136774604646417234884035774" }],
        "53274225820509157"
      )
    );

    it(
      "Should calculate square root of 'memory' value",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "memory" }],
        "982713752979381",
        undefined,
        "965726320294821369094524117013"
      )
    );

    it(
      "Should return 8 for 64",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "keyboard", value: 64 }],
        8
      )
    );

    it(
      "Should return 5 for 32",
      async () => mathOperatorTestcase(
        aliceCalculator,
        "writeSqrt",
        [{ type: "keyboard", value: 32 }],
        5
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobCalculator,
        "writeSqrt",
        { type: "keyboard", value: -42 }
      )
    );
  });
});
