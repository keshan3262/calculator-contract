#include "./errors.ligo"
#include "./types.ligo"

[@inline] function get_operand_value(
  const arg : operation_argument_t;
  const s   : storage_t
) : int is
  case arg of
  | Display_value -> s.display_value
  | Keyboard_value(value) -> value
  end;

function only_owner(
  const owner_address : address
) : unit is block {
  if Tezos.sender =/= owner_address
    then failwith(not_owner)
    else skip;
} with unit
