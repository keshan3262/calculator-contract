import { ContractAbstraction, ContractProvider, TransferParams, UnitValue } from "@taquito/taquito";
import { rejects, strictEqual } from "assert";
import BigNumber from "bignumber.js";

import { Tezos } from "./utils/cli";

interface MathOperationArgumentBase {
  type: "keyboard_value" | "display_value" | "memory_value";
}

interface KeyboardValue extends MathOperationArgumentBase {
  type: "keyboard_value";
  value: BigNumber.Value;
}

interface DisplayValue extends MathOperationArgumentBase {
  type: "display_value";
}

interface MemoryValue extends MathOperationArgumentBase {
  type: "memory_value";
}

type MathOperationArgument = KeyboardValue | DisplayValue | MemoryValue;

type OperationResult = BigNumber.Value | { error: string };

const isErrorResult = (result: OperationResult): result is { error: string } =>
  typeof result === "object" && "error" in result;

const assertResultMatch = (expected: OperationResult, received: OperationResult) => {
  if (isErrorResult(expected) && isErrorResult(received)) {
    strictEqual(
      expected.error,
      received.error,
      `Expected to fail with error '${expected.error}' but failed with error '${received.error}'`
    );
  } else if (isErrorResult(expected)) {
    throw new Error(
      `Expected to fail with error '${expected.error}' but received result ${received.toString()}`
    );
  } else if (isErrorResult(received)) {
    throw new Error(
      `Expected to receive result ${expected.toString()} but failed with error '${received.error}'`
    );
  } else {
    strictEqual(new BigNumber(received).toFixed(), new BigNumber(expected).toFixed());
  }
};

export const getSettingInitialValuesTransfersParams = (
  contract: ContractAbstraction<ContractProvider>,
  initialDisplayValue?: BigNumber.Value,
  initialMemValue?: BigNumber.Value
) => {
  const result: TransferParams[] = [];

  if (initialDisplayValue !== undefined) {
    result.push(contract.methods.set_display(initialDisplayValue).toTransferParams());
  }
  if (initialMemValue !== undefined) {
    result.push(
      contract.methods.reset_memory().toTransferParams(),
      contract.methods.add_memory("add_memory_keyboard_value", initialMemValue).toTransferParams()
    );
  }

  return result;
};

export const nonOwnerTestcase = async (
  contract: ContractAbstraction<ContractProvider>,
  methodName: string,
  args: any[]
) => rejects(
  () => contract.methods[methodName](...args).send(),
  (e: Error) => e.message === "Calculator/not-owner"
);

const genericOperationTestcase = async (
  contract: ContractAbstraction<ContractProvider>,
  methodName: string,
  args: any[],
  expectedResult: OperationResult,
  successResultFn: (storage: any) => BigNumber.Value,
  tezos = Tezos,
  initialDisplayValue?: BigNumber.Value,
  initialMemValue?: BigNumber.Value
) => {
  let batch = tezos.wallet.batch();
  getSettingInitialValuesTransfersParams(contract, initialDisplayValue, initialMemValue)
    .forEach(transferParams => batch = batch.withTransfer(transferParams));
  batch = batch.withTransfer(contract.methods[methodName](...args).toTransferParams());
  let result: OperationResult = '0';
  try {
    const op = await batch.send();
    await op.confirmation();
    const storage = await contract.storage<any>();
    result = successResultFn(storage);
  } catch (e) {
    result = { error: e.message };
  }
  assertResultMatch(expectedResult, result);
};

export const nonOwnerMathOperatorTestcase = (
  contract: ContractAbstraction<ContractProvider>,
  methodName: string,
  args: MathOperationArgument[]
) => nonOwnerTestcase(
  contract,
  methodName,
  args.map(arg => [arg.type, arg.type === "keyboard_value" ? arg.value : UnitValue]).flat()
);

export const mathOperatorTestcase = async (
  contract: ContractAbstraction<ContractProvider>,
  methodName: string,
  args: MathOperationArgument[],
  expectedResult: OperationResult,
  tezos = Tezos,
  initialDisplayValue?: BigNumber.Value,
  initialMemValue?: BigNumber.Value
) => genericOperationTestcase(
  contract,
  methodName,
  args.map(arg => [arg.type, arg.type === "keyboard_value" ? arg.value : UnitValue]).flat(),
  expectedResult,
  storage => storage.display_value,
  tezos,
  initialDisplayValue,
  initialMemValue
);

export const memOperationTestcase = async (
  contract: ContractAbstraction<ContractProvider>,
  methodName: string,
  args: any[],
  expectedResult: OperationResult,
  initialMemValue: BigNumber.Value,
  initialDisplayValue?: BigNumber.Value,
  tezos = Tezos
) => genericOperationTestcase(
  contract,
  methodName,
  args,
  expectedResult,
  storage => storage.memory_value,
  tezos,
  initialDisplayValue,
  initialMemValue
);
