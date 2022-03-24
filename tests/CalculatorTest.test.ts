import { Tezos, signerAlice } from "./utils/cli";
import { migrate } from '../scripts/helpers';

import { ContractAbstraction, ContractProvider, UnitValue } from '@taquito/taquito';
import { strictEqual } from 'assert';
import BigNumber from 'bignumber.js';

interface OperationArgumentBase {
  type: "keyboard_value" | "display_value";
}

interface KeyboardValue extends OperationArgumentBase {
  type: "keyboard_value";
  value: BigNumber.Value;
}

interface DisplayValue extends OperationArgumentBase {
  type: "display_value";
}

type OperationArgument = KeyboardValue | DisplayValue;

type OperationResult = BigNumber.Value | { error: string };

const operatorTestcase = async (
  contract: ContractAbstraction<ContractProvider>,
  methodName: string,
  args: OperationArgument[],
  expectedResult: OperationResult,
  initialValue?: BigNumber.Value
) => {
  let batch = Tezos.wallet.batch();
  if (initialValue !== undefined) {
    batch = batch.withTransfer(contract.methods.set(initialValue).toTransferParams());
  }
  batch = batch.withTransfer(contract.methods[methodName](
    ...(args.map(arg => [arg.type, arg.type === 'display_value' ? UnitValue : arg.value])).flat()
  ).toTransferParams());
  const isFailResult = typeof expectedResult === 'object' && 'error' in expectedResult;
  try {
    const op = await batch.send();
    await op.confirmation();
    const storage = await contract.storage<any>();
    strictEqual(isFailResult, false);
    strictEqual(
      storage.display_value.toFixed(),
      new BigNumber(expectedResult as BigNumber.Value).toFixed()
    );
  } catch (e) {
    if (isFailResult) {
      strictEqual(e.message, expectedResult.error);
    } else {
      throw e;
    }
  }
};

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
    it("Should add two Keyboard_value values", async () => operatorTestcase(
      contract,
      "plus",
      [{ type: 'keyboard_value', value: -42 }, { type: 'keyboard_value', value: 58 }],
      16
    ));

    it("Should add Display_value to Keyboard_value", async () => operatorTestcase(
      contract,
      "plus",
      [{ type: "keyboard_value", value: 3 }, { type: "display_value" }],
      11,
      8
    ));
  });

  describe("Testing entrypoint: Minus", function () {
    it("Should negate one Keyboard_value from another one", async () => operatorTestcase(
      contract,
      "minus",
      [{ type: 'keyboard_value', value: -42 }, { type: 'keyboard_value', value: 58 }],
      -100
    ));

    it("Should negate Keyboard_value from Display_value", async () => operatorTestcase(
      contract,
      "minus",
      [{ type: "display_value" }, { type: "keyboard_value", value: 3 }],
      5,
      8
    ));
  });

  describe("Testing entrypoint: Mul", function () {
    it("Should multiply two Keyboard_value values", async () => operatorTestcase(
      contract,
      "mul",
      [{ type: 'keyboard_value', value: -7 }, { type: 'keyboard_value', value: 8 }],
      -56
    ));

    it("Should multiply Display_value and Keyboard_value", async () => operatorTestcase(
      contract,
      "mul",
      [{ type: "keyboard_value", value: 3 }, { type: "display_value" }],
      24,
      8
    ));
  });

  describe("Testing entrypoint: Div", function () {
    it("Should throw div-by-zero error for zero divisor from Keyboard_value", async () => operatorTestcase(
      contract,
      "div",
      [{ type: "keyboard_value", value: 1 }, { type: "keyboard_value", value: 0 }],
      { error: "div-by-zero" }
    ));

    it("Should throw div-by-zero error for zero divisor from Display_value", async () => operatorTestcase(
      contract,
      "div",
      [{ type: "keyboard_value", value: 1 }, { type: "display_value" }],
      { error: "div-by-zero" },
      0
    ));

    it("Should divide zero by non-zero value", async () => operatorTestcase(
      contract,
      "div",
      [{ type: "keyboard_value", value: 0 }, { type: "keyboard_value", value: 1 }],
      0
    ));

    it("Should divide a Keyboard_value by another one", async () => operatorTestcase(
      contract,
      "div",
      [{ type: 'keyboard_value', value: 17 }, { type: 'keyboard_value', value: 6 }],
      2
    ));

    it("Should divide Display_value by Keyboard_value", async () => operatorTestcase(
      contract,
      "div",
      [{ type: "display_value" }, { type: "keyboard_value", value: 4 }],
      7,
      28
    ));
  });

  describe("Testing entrypoint: Sqrt", function () {
    it(
      "Should throw sqrt-of-negative error for negative Keyboard_value",
      async () => operatorTestcase(
        contract,
        "sqrt",
        [{ type: "keyboard_value", value: -1 }],
        { error: "sqrt-of-negative" }
      )
    );

    it(
      "Should throw sqrt-of-negative error for negative Display_value",
      async () => operatorTestcase(
        contract,
        "sqrt",
        [{ type: "display_value" }],
        { error: "sqrt-of-negative" },
        -1
      )
    );

    it(
      "Should return zero for 0",
      async () => operatorTestcase(
        contract,
        "sqrt",
        [{ type: "keyboard_value", value: 0 }],
        0
      )
    );

    it(
      "Should calculate square root of Display_value",
      async () => operatorTestcase(
        contract,
        "sqrt",
        [{ type: "display_value" }],
        '94052897529346117',
        '8845947533665681022193720685353968'
      )
    );

    it(
      "Should calculate square root of Keyboard_value",
      async () => operatorTestcase(
        contract,
        "sqrt",
        [{ type: "keyboard_value", value: '2838143136774604646417234884035774' }],
        '53274225820509157'
      )
    );
  });
});
