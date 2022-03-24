#include "./types.ligo"

function set_display_value(
  const params : int;
  var s        : storage_t)
               : return_t is block {
  s.display_value := params;
} with (no_operations, s)
