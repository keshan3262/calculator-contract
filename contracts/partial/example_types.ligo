type storage_t          is [@layout:comb] record[
  owner                   : address;
  foo                     : nat;
]

type example_param_t    is nat

type return_t           is list(operation) * storage_t

type parameter_t        is
| Example                 of example_param_t
| Example_2               of example_param_t

[@inline] const no_operations : list(operation) = nil;