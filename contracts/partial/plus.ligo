#include "./types.ligo"

function plus(
  const param : binary_operation_param_t;
  var s       : storage_t)
              : return_t is block {
  const operand1 : int = case param.operand1 of
  | Display_value -> s.display_value
  | Keyboard_value(value) -> value
  end;

  const operand2 : int = case param.operand2 of
  | Display_value -> s.display_value
  | Keyboard_value(value) -> value
  end;

  s.display_value := operand1 + operand2;
} with (no_operations, s)
