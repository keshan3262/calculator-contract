type storage_t          is [@layout:comb] record [
  owner                   : address;
  display_value           : int;
  memory_value            : int;
]

type add_memory_argument_t    is
| Add_memory_display_value    of unit
| Add_memory_keyboard_value   of int

type negate_memory_argument_t     is
| Negate_memory_display_value   of unit
| Negate_memory_keyboard_value  of int

type operand_t          is
| Display_value           of unit
| Memory_value            of unit
| Keyboard_value          of int

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
| Add_memory              of add_memory_argument_t
| Negate_memory           of negate_memory_argument_t
| Clear_memory            of unit
| Set_display             of int

[@inline] const no_operations : list(operation) = nil;
