#include "../types.ligo"
#include "../utils.ligo"

function mem_minus(
  const params          : mem_minus_argument_t;
  var s                 : storage_t)
                        : return_t is
  block {
    only_owner(s.owner);
    const operand : int = case params of
    | Mem_minus_display_value         -> s.display_value
    | Mem_minus_keyboard_value(value) -> value
    end;
    s.memory_value := s.memory_value - operand;
  } with (no_operations, s)
