#include "./errors.ligo"
#include "./types.ligo"

[@inline] function get_operand_value(
  const arg             : operand_t;
  const s               : storage_t)
                        : int is
  case arg of [
  | Display(_)      -> s.display_value
  | Memory(_)       -> s.memory_value
  | Keyboard(value) -> value
  ];

[@inline] function require(
  const param           : bool;
  const error           : string)
                        : unit is 
  assert_with_error(param, error)

[@inline] function assert_owner(
  const owner_address   : address)
                        : unit is
  require(Tezos.sender = owner_address, Calculator.not_owner)

[@inline] function unwrap<a>(
  const param           : option(a);
  const error           : string)
                        : a is
  case param of [
  | Some(instance) -> instance
  | None -> failwith(error)
  ];

[@inline] function nat_or_error(
  const value           : int;
  const err             : string)
                        : nat is
  unwrap(is_nat(value), err);

