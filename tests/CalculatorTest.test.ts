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

const binaryOperatorTestcase = async (
  contract: ContractAbstraction<ContractProvider>,
  methodName: string,
  arg1: OperationArgument,
  arg2: OperationArgument,
  expectedResult: OperationResult,
  initialValue?: BigNumber.Value
) => {
  let batch = Tezos.wallet.batch();
  if (initialValue !== undefined) {
    batch = batch.withTransfer(contract.methods.set(initialValue).toTransferParams());
  }
  batch = batch.withTransfer(contract.methods[methodName](
    arg1.type,
    arg1.type === 'display_value' ? UnitValue : arg1.value,
    arg2.type,
    arg2.type === 'display_value' ? UnitValue : arg2.value
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
    it("Should add two Keyboard_value values", async () => binaryOperatorTestcase(
      contract,
      "plus",
      { type: 'keyboard_value', value: -42 },
      { type: 'keyboard_value', value: 58 },
      16
    ));

    it("Should add Display_value to Keyboard_value", async () => binaryOperatorTestcase(
      contract,
      "plus",
      { type: "keyboard_value", value: 3 },
      { type: "display_value" },
      11,
      8
    ));
  });

  describe("Testing entrypoint: Minus", function () {
    it("Should negate one Keyboard_value from another one", async () => binaryOperatorTestcase(
      contract,
      "minus",
      { type: 'keyboard_value', value: -42 },
      { type: 'keyboard_value', value: 58 },
      -100
    ));

    it("Should negate Keyboard_value from Display_value", async () => binaryOperatorTestcase(
      contract,
      "minus",
      { type: "display_value" },
      { type: "keyboard_value", value: 3 },
      5,
      8
    ));
  });

  describe("Testing entrypoint: Mul", function () {
    it("Should multiply two Keyboard_value values", async () => binaryOperatorTestcase(
      contract,
      "mul",
      { type: 'keyboard_value', value: -7 },
      { type: 'keyboard_value', value: 8 },
      -56
    ));

    it("Should multiply Display_value and Keyboard_value", async () => binaryOperatorTestcase(
      contract,
      "mul",
      { type: "keyboard_value", value: 3 },
      { type: "display_value" },
      24,
      8
    ));
  });

  describe("Testing entrypoint: Div", function () {
    it("Should throw div-by-zero error for an attempt to divide by zero from Keyboard_value", async () => binaryOperatorTestcase(
      contract,
      "div",
      { type: "keyboard_value", value: 1 },
      { type: "keyboard_value", value: 0 },
      { error: "div-by-zero" }
    ));

    it("Should throw div-by-zero error for an attempt to divide by zero from Display_value", async () => binaryOperatorTestcase(
      contract,
      "div",
      { type: "keyboard_value", value: 1 },
      { type: "display_value" },
      { error: "div-by-zero" },
      0
    ));

    it("Should divide zero by non-zero value", async () => binaryOperatorTestcase(
      contract,
      "div",
      { type: "keyboard_value", value: 0 },
      { type: "keyboard_value", value: 1 },
      0
    ));

    it("Should divide a Keyboard_value by another one", async () => binaryOperatorTestcase(
      contract,
      "div",
      { type: 'keyboard_value', value: 17 },
      { type: 'keyboard_value', value: 6 },
      2
    ));

    it("Should divide Display_value by Keyboard_value", async () => binaryOperatorTestcase(
      contract,
      "div",
      { type: "display_value" },
      { type: "keyboard_value", value: 4 },
      7,
      28
    ));
  });
});
