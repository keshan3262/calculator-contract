#include "./errors.ligo"
#include "./types.ligo"

[@inline] function get_operand_value(
  const arg             : operand_t;
  const s               : storage_t)
                        : int is
  case arg of
  | Display_value(_)      -> s.display_value
  | Memory_value(_)       -> s.memory_value
  | Keyboard_value(value) -> value
  end;

function assert_owner(
  const owner_address   : address)
                        : unit is
  assert_with_error(Tezos.sender = owner_address, Calculator.not_owner)
