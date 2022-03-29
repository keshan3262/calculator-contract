#include "../types.ligo"
#include "../utils.ligo"

function plus(
  const param           : operand_pair_t;
  var s                 : storage_t)
                        : return_t is
  block {
    only_owner(s.owner);
    const operand1 : int = get_operand_value(param.operand1, s);
    const operand2 : int = get_operand_value(param.operand2, s);
    s.display_value := operand1 + operand2;
  } with (no_operations, s)
