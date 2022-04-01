import BigNumber from "bignumber.js";

import { alice } from "../../scripts/sandbox/accounts";

const storage = {
  owner: alice.pkh,
  display_value: new BigNumber(0),
  memory_value: new BigNumber(0)
};

export default storage;
