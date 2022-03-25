#include "../partial/types.ligo"
#include "../partial/operations/plus.ligo"
#include "../partial/operations/minus.ligo"
#include "../partial/operations/mul.ligo"
#include "../partial/operations/div.ligo"
#include "../partial/operations/sqrt.ligo"
#include "../partial/operations/set.ligo"

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
