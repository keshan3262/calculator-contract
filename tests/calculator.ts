import { ContractAbstraction, ContractMethod, ContractProvider, TezosToolkit, UnitValue } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { confirmOperation } from "../utils/confirmation";
import { initTezos } from "../utils/helpers";

import defaultStorage from "./storage/storage";

interface MathOperationArgumentBase {
  type: "keyboard" | "display" | "memory";
}

interface KeyboardValue extends MathOperationArgumentBase {
  type: "keyboard";
  value: BigNumber.Value;
}

interface DisplayValue extends MathOperationArgumentBase {
  type: "display";
}

interface MemoryValue extends MathOperationArgumentBase {
  type: "memory";
}

export type MathOperationArgument = KeyboardValue | DisplayValue | MemoryValue;

interface MemoryArgumentValueBase {
  type: "memory_display" | "memory_keyboard";
}

interface MemoryDisplayValue extends MemoryArgumentValueBase {
  type: "memory_display";
}

interface MemoryKeyboardValue extends MemoryArgumentValueBase {
  type: "memory_keyboard";
  value: BigNumber.Value;
}

export type MemoryArgumentValue = MemoryDisplayValue | MemoryKeyboardValue;

type ContractMathOperation = "add" | "negate" | "multiply" | "divide" | "write_sqrt";

export interface CalculatorStorage {
  owner: string;
  display_value: BigNumber;
  memory_value: BigNumber;
}

export class Calculator {
  storage: CalculatorStorage = defaultStorage;

  constructor(
    private tezos: TezosToolkit,
    private contract: ContractAbstraction<ContractProvider>
  ) {}

  static async init(accountAlias: string, contractAddress: string) {
    const tezos = await initTezos(accountAlias);

    return new Calculator(tezos, await tezos.contract.at(contractAddress));
  }

  async updateStorage() {
    this.storage = await this.contract.storage();
  }

  async sendBatch(methods: ContractMethod<ContractProvider>[]) {
    const batch = await this.tezos.wallet.batch([]);
    methods.forEach(method => batch.withTransfer(method.toTransferParams()));
    const op = await batch.send();
    await confirmOperation(this.tezos, op.opHash);

    return op;
  }

  async sendSingle(method: ContractMethod<ContractProvider>) {
    const op = await method.send();
    await confirmOperation(this.tezos, op.hash);

    return op;
  }

  async getDisplay(): Promise<BigNumber> {
    return this.contract.contractViews.get_display().executeView({
      viewCaller: await this.tezos.wallet.pkh()
    });
  }

  private mathOperationMethod(method: ContractMathOperation, ...operands: MathOperationArgument[]) {
    return this.contract.methods[method](
      ...operands.map(arg => [arg.type, arg.type === "keyboard" ? arg.value : UnitValue]).flat()
    );
  }

  add(operand1: MathOperationArgument, operand2: MathOperationArgument) {
    return this.mathOperationMethod("add", operand1, operand2);
  }

  negate(operand1: MathOperationArgument, operand2: MathOperationArgument) {
    return this.mathOperationMethod("negate", operand1, operand2);
  }

  multiply(operand1: MathOperationArgument, operand2: MathOperationArgument) {
    return this.mathOperationMethod("multiply", operand1, operand2);
  }

  divide(operand1: MathOperationArgument, operand2: MathOperationArgument) {
    return this.mathOperationMethod("divide", operand1, operand2);
  }

  writeSqrt(arg: MathOperationArgument) {
    return this.mathOperationMethod("write_sqrt", arg);
  }

  private memoryOperationMethod(method: "add_memory" | "negate_memory", arg: MemoryArgumentValue) {
    return this.contract.methods[method](arg.type, arg.type === "memory_keyboard" ? arg.value : UnitValue);
  }

  addMemory(arg: MemoryArgumentValue) {
    return this.memoryOperationMethod("add_memory", arg);
  }

  negateMemory(arg: MemoryArgumentValue) {
    return this.memoryOperationMethod("negate_memory", arg);
  }

  resetMemory() {
    return this.contract.methods.reset_memory();
  }

  setDisplay(value: BigNumber.Value) {
    return this.contract.methods.set_display(value);
  }
}

export type BinaryOperatorMethodName = "add" | "negate" | "multiply" | "divide";
export type UnaryOperatorMethodName = "writeSqrt";
export type AssignResultMemoryMethodName = "addMemory" | "negateMemory";
export type ResetMemoryMethodName = "resetMemory";
export type SetDisplayMethodName = "setDisplay";
