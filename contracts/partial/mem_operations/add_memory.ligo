#include "../types.ligo"
#include "../utils.ligo"

function add_memory(
  const params          : add_memory_argument_t;
  var s                 : storage_t)
                        : return_t is
  block {
    only_owner(s.owner);
    const operand : int = case params of
    | Add_memory_display_value(_)      -> s.display_value
    | Add_memory_keyboard_value(value) -> value
    end;
    s.memory_value := s.memory_value + operand;
  } with (no_operations, s)
