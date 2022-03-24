#include "./errors.ligo"
#include "./types.ligo"

function div(
  const param : binary_operation_param_t;
  var s       : storage_t)
              : return_t is block {
  const operand1 : int = get_operand_value(param.operand1, s);
  const operand2 : int = get_operand_value(param.operand2, s);
  if operand2 = 0
    then failwith(div_by_zero)
    else s.display_value := operand1 / operand2;
} with (no_operations, s)
