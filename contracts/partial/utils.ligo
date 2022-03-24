#include "./types.ligo"

[@inline] function get_operand_value(
  const arg : operation_argument_t;
  const s   : storage_t
) : int is
  case arg of
  | Display_value -> s.display_value
  | Keyboard_value(value) -> value
  end;
