// An example of code which can be used for debugging of test code using taquito module
import { initTezos } from "../utils/helpers";
import { michelson as contractCode } from "../build/calculator.json";
import { alice } from "./sandbox/accounts";

(async () => {
  console.log("Initializing tezos toolkit...");
  const Tezos = await initTezos();
  console.log("Originating test contract...");
  const operation = await Tezos.wallet.originate({
    code: contractCode,
    storage: { owner: alice.pkh, display_value: 0, memory_value: 0 }
  }).send();

  console.log("Waiting for confirmation...");
  await operation.confirmation();

  const contract = await operation.contract();
  console.log(`Contract address is ${contract.address}`);
  try {
    const method = await contract.methods.mem_plus("mem_plus_keyboard_value", 4);
    console.log(method.toTransferParams());
  } catch (e) {
    console.error(e);
  }
})();