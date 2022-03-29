#include "./errors.ligo"
#include "./types.ligo"

[@inline] function get_operand_value(
  const arg : operand_t;
  const s   : storage_t)
            : int is
  case arg of
  | Display_value -> s.display_value
  | Memory_value -> s.memory_value
  | Keyboard_value(value) -> value
  end;

function only_owner(const owner_address : address) : unit is block {
  if Tezos.sender =/= owner_address
    then failwith(Calculator.not_owner)
    else skip;
} with unit
