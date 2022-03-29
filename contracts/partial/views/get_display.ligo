#include "../types.ligo"

[@view] function get_display(
  const _               : unit;
  const s               : storage_t)
                        : int is
  s.display_value
