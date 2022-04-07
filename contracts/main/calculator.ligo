#include "../partial/types.ligo"
#include "../partial/mem_operations/add_memory.ligo"
#include "../partial/mem_operations/negate_memory.ligo"
#include "../partial/mem_operations/reset_memory.ligo"
#include "../partial/operations/add.ligo"
#include "../partial/operations/negate.ligo"
#include "../partial/operations/multiply.ligo"
#include "../partial/operations/divide.ligo"
#include "../partial/operations/write_sqrt.ligo"
#include "../partial/operations/set_display.ligo"
#include "../partial/views/get_display.ligo"

function main(
  const action          : parameter_t;
  const s               : storage_t)
                        : return_t is
  case action of [
  | Add(params)           -> add(params, s)
  | Negate(params)        -> negate(params, s)
  | Multiply(params)      -> multiply(params, s)
  | Divide(params)        -> divide(params, s)
  | Write_sqrt(params)    -> write_sqrt(params, s)
  | Set_display(params)   -> set_display(params, s)
  | Add_memory(params)    -> add_memory(params, s)
  | Negate_memory(params) -> negate_memory(params, s)
  | Reset_memory(_)       -> reset_memory(s)
  ]
