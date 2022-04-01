import { Tezos, signerAlice } from "./utils/cli";
import { migrate } from "../scripts/helpers";

import { strictEqual } from "assert";
import { getSettingInitialValuesMethods } from "./helpers";
import { Calculator } from "./calculator";
import initialStorage from "./storage/storage";

describe("Calculator views test", function () {
  let calculator: Calculator;

  beforeAll(async () => {
    try {
      Tezos.setSignerProvider(signerAlice);

      const deployedContract = await migrate(
        Tezos,
        "calculator",
        initialStorage,
        "sandbox"
      );

      calculator = await Calculator.init("alice", deployedContract);
    } catch (e) {
      console.log(e);
    }
  });

  describe("Testing view: Get_display", function () {
    it("Should return display_value", async () => {
      await calculator.sendBatch(getSettingInitialValuesMethods(calculator, 1, 2));

      const result = await calculator.getDisplay();
      strictEqual(result.toNumber(), 1);
    });
  });
});
