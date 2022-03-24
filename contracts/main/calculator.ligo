#include "../partial/types.ligo"
#include "../partial/plus.ligo"
#include "../partial/set.ligo"

function main(
  const action          : parameter_t;
  const s               : storage_t)
                        : return_t is
  case action of
  | Plus(params)           -> plus(params, s)
  | Set(params)            -> set_display_value(params, s)
  end
