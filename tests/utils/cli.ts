import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

import { alice as aliceAccount } from "../../scripts/sandbox/accounts";
import { bob } from "../../scripts/sandbox/accounts";

import config from '../../config';

export const alice = aliceAccount;

const networkConfig = config.networks[config.deployNetwork];

const rpc = `${networkConfig.host}:${networkConfig.port}`;
export const Tezos = new TezosToolkit(rpc);

export const signerAlice = new InMemorySigner(networkConfig.accounts.alice.sk);
export const signerBob = new InMemorySigner(bob.sk);

Tezos.setSignerProvider(signerAlice);
