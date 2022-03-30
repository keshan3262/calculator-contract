type storage_t          is [@layout:comb] record [
  owner                   : address;
  display_value           : int;
  memory_value            : int;
]

type memory_arg_value_t is
| Memory_display      of unit
| Memory_keyboard     of int

(* Two entrypoints with same arg of union type cannot be added *)
type memory_arg_t       is [@layout:comb] record [
  value                   : memory_arg_value_t;
]

type operand_t          is
| Display                 of unit
| Memory                  of unit
| Keyboard                of int

type operand_pair_t     is [@layout:comb] record [
  operand1                : operand_t;
  operand2                : operand_t;
]

type return_t           is list(operation) * storage_t

type parameter_t        is
| Add                     of operand_pair_t
| Negate                  of operand_pair_t
| Multiply                of operand_pair_t
| Divide                  of operand_pair_t
| Write_sqrt              of operand_t
| Add_memory              of memory_arg_t
| Negate_memory           of memory_arg_t
| Reset_memory            of unit
| Set_display             of int

[@inline] const no_operations : list(operation) = nil;
