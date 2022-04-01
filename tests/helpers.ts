import { ContractMethod, ContractProvider, UnitValue } from "@taquito/taquito";
import { rejects, strictEqual } from "assert";
import BigNumber from "bignumber.js";

import {
  AssignResultMemoryMethodName,
  BinaryOperatorMethodName,
  Calculator,
  MathOperationArgument,
  MemoryArgumentValue,
  ResetMemoryMethodName,
  UnaryOperatorMethodName
} from "./calculator";

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

export const getSettingInitialValuesMethods = (
  calculator: Calculator,
  initialDisplayValue?: BigNumber.Value,
  initialMemValue?: BigNumber.Value
) => {
  const result: ContractMethod<ContractProvider>[] = [];

  if (initialDisplayValue !== undefined) {
    result.push(calculator.setDisplay(initialDisplayValue));
  }
  if (initialMemValue !== undefined) {
    result.push(
      calculator.resetMemory(),
      calculator.addMemory({ type: "memory_keyboard", value: initialMemValue })
    );
  }

  return result;
};

export const nonOwnerTestcase = async (method: ContractMethod<ContractProvider>) => rejects(
  () => method.send(),
  (e: Error) => e.message === "Calculator/not-owner"
);

const genericOperationTestcase = async (
  calculator: Calculator,
  method: ContractMethod<ContractProvider>,
  expectedResult: OperationResult,
  successResultFn: (storage: any) => BigNumber.Value,
  initialDisplayValue?: BigNumber.Value,
  initialMemValue?: BigNumber.Value
) => {
  let result: OperationResult = '0';
  try {
    const presetMethods = getSettingInitialValuesMethods(calculator, initialDisplayValue, initialMemValue);
    await calculator.sendBatch([
      ...presetMethods,
      method
    ]);
    await calculator.updateStorage();
    result = successResultFn(calculator.storage);
  } catch (e) {
    result = { error: e.message };
  }
  assertResultMatch(expectedResult, result);
};

export const nonOwnerMathOperatorTestcase = (
  calculator: Calculator,
  methodName: BinaryOperatorMethodName | UnaryOperatorMethodName,
  ...args: MathOperationArgument[]
) => nonOwnerTestcase(
  methodName === "writeSqrt" ? calculator.writeSqrt(args[0]) : calculator[methodName](args[0], args[1]),
);

export const mathOperatorTestcase = async (
  calculator: Calculator,
  methodName: BinaryOperatorMethodName | UnaryOperatorMethodName,
  args: MathOperationArgument[],
  expectedResult: OperationResult,
  initialDisplayValue?: BigNumber.Value,
  initialMemValue?: BigNumber.Value
) => genericOperationTestcase(
  calculator,
  methodName === "writeSqrt" ? calculator.writeSqrt(args[0]) : calculator[methodName](args[0], args[1]),
  expectedResult,
  storage => storage.display_value,
  initialDisplayValue,
  initialMemValue
);

export const memOperationTestcase = async (
  calculator: Calculator,
  methodName: AssignResultMemoryMethodName | ResetMemoryMethodName,
  args: MemoryArgumentValue[],
  expectedResult: OperationResult,
  initialMemValue: BigNumber.Value,
  initialDisplayValue?: BigNumber.Value,
) => genericOperationTestcase(
  calculator,
  methodName === "resetMemory" ? calculator.resetMemory() : calculator[methodName](args[0]),
  expectedResult,
  storage => storage.memory_value,
  initialDisplayValue,
  initialMemValue
);
