#include "../types.ligo"
#include "../utils.ligo"

function negate_memory(
  const params          : memory_arg_t;
  var s                 : storage_t)
                        : return_t is
  block {
    assert_owner(s.owner);
    const operand : int = case params.value of [
    | Memory_display(_)      -> s.display_value
    | Memory_keyboard(value) -> value
    ];
    s.memory_value := s.memory_value - operand;
  } with (no_operations, s)
