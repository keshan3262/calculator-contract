#include "../types.ligo"
#include "../utils.ligo"

function mem_clear(var s: storage_t) : return_t is block {
  only_owner(s.owner);
  s.memory_value := 0;
} with (no_operations, s)
