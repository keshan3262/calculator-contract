#include "../types.ligo"
#include "../utils.ligo"

function negate_memory(
  const params          : negate_memory_argument_t;
  var s                 : storage_t)
                        : return_t is
  block {
    assert_owner(s.owner);
    const operand : int = case params of
    | Negate_memory_display_value         -> s.display_value
    | Negate_memory_keyboard_value(value) -> value
    end;
    s.memory_value := s.memory_value - operand;
  } with (no_operations, s)
