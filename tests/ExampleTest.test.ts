import { Tezos, signerAlice, signerBob } from "./utils/cli";
import { migrate } from '../scripts/helpers';
const { rejects, strictEqual, notStrictEqual } = require("assert");

const { alice } = require("../scripts/sandbox/accounts");

describe("Example test", function () {
  let contract;

  beforeAll(async () => {
    try {
      Tezos.setSignerProvider(signerAlice);
      const storage = require("./storage/storage");

      const deployedContract = await migrate(
        Tezos,
        "example",
        storage,
        "sandbox"
      );
      contract = await Tezos.contract.at(deployedContract);

    } catch (e) {
      console.log(e);
    }
  });

  describe("Testing entrypoint: Example", function () {
    it("Revert example", async function () {
      await rejects(contract.methods.example(2).send(), err => {
        strictEqual(err.message, "Example");
        return true;
      });
    });
    it("Should allow example", async function () {
      const op = await contract.methods.example(1).send();
      await op.confirmation();
      const storage = await contract.storage()
      strictEqual(storage.foo.toNumber(), 42);
    });
  });
});
