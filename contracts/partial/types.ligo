type storage_t                is [@layout:comb] record [
  owner                         : address;
  display_value                 : int;
]

type operation_argument_t     is 
| Display_value
| Keyboard_value                of int

type binary_operation_param_t is [@layout:comb] record [
  operand1                      : operation_argument_t;
  operand2                      : operation_argument_t;
]

type return_t                 is list(operation) * storage_t

type parameter_t              is
| Plus                          of binary_operation_param_t
| Set                           of int

[@inline] const no_operations : list(operation) = nil;
