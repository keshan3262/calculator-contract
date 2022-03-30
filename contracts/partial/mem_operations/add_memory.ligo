#include "../types.ligo"
#include "../utils.ligo"

function add_memory(
  const params          : memory_arg_t;
  var s                 : storage_t)
                        : return_t is
  block {
    assert_owner(s.owner);
    const toofta1 = params.value;
    const operand : int = case toofta1 of
    | Memory_display(_)      -> s.display_value
    | Memory_keyboard(value) -> value
    end;
    s.memory_value := s.memory_value + operand;
  } with (no_operations, s)
