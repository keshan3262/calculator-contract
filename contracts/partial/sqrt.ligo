#include "./types.ligo"
#include "./errors.ligo"

[@inline] function get_next_estimate(
  const argument : nat;
  const estimate : nat
) : nat is (estimate + argument / estimate) / 2n;

recursive function sqrt_iteration(
  const argument : nat;
  const estimate : nat
) : nat is if get_next_estimate(argument, estimate) >= estimate
  then estimate
  else sqrt_iteration(argument, get_next_estimate(argument, estimate));

function sqrt(
  const params : operation_argument_t;
  var s        : storage_t)
               : return_t is block {
  const argument : int = get_operand_value(params, s);
  if argument < 0
    then failwith(sqrt_of_negative)
    else skip;
  
  if argument = 0 or argument = 1
    then s.display_value := argument
    else block {
      const argument_bytes : bytes = Bytes.pack(argument);
      // Length of bytes after 0500 prefix
      const pure_argument_bytes_length : nat = abs(Bytes.length(argument_bytes) - 2n);
      // 2 ** (number_bytes_count * 4)
      const cunning_initial_sqrt_estimate : nat = Bitwise.shift_left(
        1n,
        pure_argument_bytes_length * 4n
      );
      const stupid_initial_sqrt_estimate : nat = abs(argument / 2);
      const initial_sqrt_estimate = if stupid_initial_sqrt_estimate < cunning_initial_sqrt_estimate
        then stupid_initial_sqrt_estimate
        else cunning_initial_sqrt_estimate;
      s.display_value := int(sqrt_iteration(abs(argument), initial_sqrt_estimate));
    };
} with (no_operations, s)
