#include "../partial/types.ligo"
#include "../partial/plus.ligo"
#include "../partial/minus.ligo"
#include "../partial/mul.ligo"
#include "../partial/div.ligo"
#include "../partial/sqrt.ligo"
#include "../partial/set.ligo"

function main(
  const action          : parameter_t;
  const s               : storage_t)
                        : return_t is
  case action of
  | Plus(params)           -> plus(params, s)
  | Minus(params)          -> minus(params, s)
  | Mul(params)            -> mul(params, s)
  | Div(params)            -> div(params, s)
  | Sqrt(params)           -> sqrt(params, s)
  | Set(params)            -> set_display_value(params, s)
  end
