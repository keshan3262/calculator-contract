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
    it("Should add two 'keyboard' values", async () => mathOperatorTestcase(
      aliceContract,
      "add",
      [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }],
      16
    ));

    it("Should add 'display' value to 'keyboard' value", async () => mathOperatorTestcase(
      aliceContract,
      "add",
      [{ type: "keyboard", value: 3 }, { type: "display" }],
      11,
      Tezos,
      8
    ));

    it("Should add 'memory' value to 'keyboard' value", async () => mathOperatorTestcase(
      aliceContract,
      "add",
      [{ type: "keyboard", value: 3 }, { type: "memory" }],
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
        [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Negate", function () {
    it("Should negate second 'keyboard' value from thr first one", async () => mathOperatorTestcase(
      aliceContract,
      "negate",
      [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }],
      -100
    ));

    it("Should negate 'keyboard' value from 'display' value", async () => mathOperatorTestcase(
      aliceContract,
      "negate",
      [{ type: "display" }, { type: "keyboard", value: 3 }],
      5,
      Tezos,
      8
    ));

    it("Should negate 'memory' value from 'keyboard' value", async () => mathOperatorTestcase(
      aliceContract,
      "negate",
      [{ type: "keyboard", value: 3 }, { type: "memory" }],
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
        [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Multiply", function () {
    it("Should multiply two 'keyboard' values", async () => mathOperatorTestcase(
      aliceContract,
      "multiply",
      [{ type: "keyboard", value: -7 }, { type: "keyboard", value: 8 }],
      -56
    ));

    it("Should multiply 'display' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceContract,
      "multiply",
      [{ type: "keyboard", value: 3 }, { type: "display" }],
      24,
      Tezos,
      8
    ));

    it("Should multiply 'memory' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceContract,
      "multiply",
      [{ type: "keyboard", value: 3 }, { type: "memory" }],
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
        [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Divide", function () {
    it("Should divide zero by non-zero value", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "keyboard", value: 0 }, { type: "keyboard", value: 1 }],
      0
    ));

    it("Should divide a 'keyboard' value by another one", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "keyboard", value: 17 }, { type: "keyboard", value: 6 }],
      2
    ));

    it("Should divide 'display' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "display" }, { type: "keyboard", value: 4 }],
      7,
      Tezos,
      28
    ));

    it("Should divide 'memory' value by 'keyboard' value", async () => mathOperatorTestcase(
      aliceContract,
      "divide",
      [{ type: "memory" }, { type: "keyboard", value: 3 }],
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
        [{ type: "keyboard", value: -42 }, { type: "keyboard", value: 58 }]
      )
    );
  });

  describe("Testing entrypoint: Write_sqrt", function () {
    it(
      "Should throw Calculator/value-negative error for negative 'keyboard' value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard", value: -1 }],
        { error: "Calculator/value-negative" }
      )
    );

    it(
      "Should throw Calculator/value-negative error for negative 'display' value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "display" }],
        { error: "Calculator/value-negative" },
        Tezos,
        -1,
        0
      )
    );

    it(
      "Should throw Calculator/value-negative error for negative 'memory' value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "memory" }],
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
        [{ type: "keyboard", value: 0 }],
        0
      )
    );

    it(
      "Should return 1 for 1",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard", value: 1 }],
        1
      )
    );

    it(
      "Should calculate square root of 'display' value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "display" }],
        "94052897529346117",
        Tezos,
        "8845947533665681022193720685353968"
      )
    );

    it(
      "Should calculate square root of 'keyboard' value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard", value: "2838143136774604646417234884035774" }],
        "53274225820509157"
      )
    );

    it(
      "Should calculate square root of 'memory' value",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "memory" }],
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
        [{ type: "keyboard", value: 64 }],
        8
      )
    );

    it(
      "Should return 5 for 32",
      async () => mathOperatorTestcase(
        aliceContract,
        "write_sqrt",
        [{ type: "keyboard", value: 32 }],
        5
      )
    );

    it(
      "Should throw 'not-owner' error if a non-owner tries to call the entrypoint",
      async () => nonOwnerMathOperatorTestcase(
        bobContract,
        "write_sqrt",
        [{ type: "keyboard", value: -42 }]
      )
    );
  });
});
