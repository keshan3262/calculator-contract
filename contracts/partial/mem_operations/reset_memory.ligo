#include "../types.ligo"
#include "../utils.ligo"

function reset_memory(
  var s                 : storage_t)
                        : return_t is
  block {
    assert_owner(s.owner);
    s.memory_value := 0;
  } with (no_operations, s)
