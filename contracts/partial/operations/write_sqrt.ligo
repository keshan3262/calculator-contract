#include "../errors.ligo"
#include "../types.ligo"
#include "../utils.ligo"

function get_estimation(
  const argument        : nat;
  const prev_estimation : nat)
                        : nat is
  (prev_estimation + argument / prev_estimation) / 2n;

recursive function estimate_sqrt(
  const argument        : nat;
  const prev_estimation : nat)
                        : nat is
  if get_estimation(argument, prev_estimation) >= prev_estimation
  then prev_estimation
  else estimate_sqrt(argument, get_estimation(argument, prev_estimation));

function write_sqrt(
  const params          : operand_t;
  var s                 : storage_t)
                        : return_t is
  block {
    assert_owner(s.owner);
    const argument : int = get_operand_value(params, s);
    assert_some_with_error(is_nat(argument), Calculator.value_negative);

    if argument = 0 or argument = 1
    then s.display_value := argument
    else s.display_value := int(estimate_sqrt(abs(argument), abs(argument / 2)));
  } with (no_operations, s)