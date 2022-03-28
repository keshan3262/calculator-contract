#include "../errors.ligo"
#include "../types.ligo"
#include "../utils.ligo"

function get_next_estimate(
  const argument : nat;
  const estimate : nat)
                 : nat is
  (estimate + argument / estimate) / 2n;

recursive function sqrt_iteration(
  const argument : nat;
  const estimate : nat)
                 : nat is
  if get_next_estimate(argument, estimate) >= estimate
    then estimate
    else sqrt_iteration(argument, get_next_estimate(argument, estimate));

function sqrt(
  const params : operation_argument_t;
  var s        : storage_t)
               : return_t is block {
  only_owner(s.owner);
  const argument : int = get_operand_value(params, s);
  if argument < 0
    then failwith(sqrt_of_negative)
    else skip;
  
  if argument = 0 or argument = 1
    then s.display_value := argument
    else s.display_value := int(sqrt_iteration(abs(argument), abs(argument / 2)));
} with (no_operations, s)
