type storage_t                      is [@layout:comb] record [
  owner                               : address;
  display_value                       : int;
  memory_value                        : int;
]

type mem_plus_argument_t            is
| Mem_plus_display_value
| Mem_plus_keyboard_value             of int

type mem_minus_argument_t is
| Mem_minus_display_value
| Mem_minus_keyboard_value            of int

type operation_argument_t           is
| Display_value
| Memory_value
| Keyboard_value                      of int

type binary_operation_param_t       is [@layout:comb] record [
  operand1                            : operation_argument_t;
  operand2                            : operation_argument_t;
]

type return_t                       is list(operation) * storage_t

type parameter_t                    is
| Plus                                of binary_operation_param_t
| Minus                               of binary_operation_param_t
| Mul                                 of binary_operation_param_t
| Div                                 of binary_operation_param_t
| Sqrt                                of operation_argument_t
| Mem_plus                            of mem_plus_argument_t
| Mem_minus                           of mem_minus_argument_t
| Mem_clear
| Set                                 of int

[@inline] const no_operations : list(operation) = nil;
