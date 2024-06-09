#once

#subruledef reg
{
    r{n: u3} => n
}

#subruledef ireg
{
    s{n: u6} => n,
    fr       => 0b000000
}

#subruledef addr
{
    {n: u16} => n
}

#ruledef mnemonics
{
    ; Memory
    store {end: addr}, {rx: reg}          => 0b110001 @ rx @ 0b0000000 @ end
    storei {rx: reg}, {ry: reg}           => 0b111101 @ rx @ ry @ 0b0000
    
    load {rx: reg}, {end: addr}           => 0b110000 @ rx @ 0b0000000 @ end
    loadi {rx: reg}, {ry: reg}            => 0b111100 @ rx @ ry @ 0b0000
    loadn {rx: reg}, #{value: i16}        => 0b111000 @ rx @ 0b0000000 @ value
    
    ; Move
    mov {rx: reg}, {ry: reg}              => 0b110011 @ rx @ ry @ 0b0000
    mov {rx: reg}, sp                     => 0b110011 @ rx @ 0b0000001
    mov sp, {rx: reg}                     => 0b110011 @ rx @ 0b0000011
    
    ; ULA
    add {rx: reg}, {ry: reg}, {rz: reg}   => 0b100000 @ rx @ ry @ rz @ 0b0
    add {rx: reg}, {ry: reg}              => asm { add {rx}, {rx}, {ry} }
    addc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100000 @ rx @ ry @ rz @ 0b1
    addc {rx: reg}, {ry: reg}             => asm { addc {rx}, {rx}, {ry} }
    
    sub {rx: reg}, {ry: reg}, {rz: reg}   => 0b100001 @ rx @ ry @ rz @ 0b0
    sub {rx: reg}, {ry: reg}              => asm { sub {rx}, {rx}, {ry} }
    subc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100001 @ rx @ ry @ rz @ 0b1
    subc {rx: reg}, {ry: reg}             => asm { subc {rx}, {rx}, {ry} }
    
    mul {rx: reg}, {ry: reg}, {rz: reg}   => 0b100010 @ rx @ ry @ rz @ 0b0
    mul {rx: reg}, {ry: reg}              => asm { mul {rx}, {rx}, {ry} }
    mulc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100010 @ rx @ ry @ rz @ 0b1
    mulc {rx: reg}, {ry: reg}             => asm { mulc {rx}, {rx}, {ry} }
    
    div {rx: reg}, {ry: reg}, {rz: reg}   => 0b100011 @ rx @ ry @ rz @ 0b0
    div {rx: reg}, {ry: reg}              => asm { div {rx}, {rx}, {ry} }
    divc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100011 @ rx @ ry @ rz @ 0b1
    divc {rx: reg}, {ry: reg}             => asm { divc {rx}, {rx}, {ry} }
    
    mod {rx: reg}, {ry: reg}, {rz: reg}   => 0b100101 @ rx @ ry @ rz @ 0b0
    mod {rx: reg}, {ry: reg}              => asm { mod {rx}, {rx}, {ry} }
    
    inc {rx: reg}                         => 0b100100 @ rx @ 0b0000000
    dec {rx: reg}                         => 0b100100 @ rx @ 0b1000000

    ; ARITH
    and {rx: reg}, {ry: reg}, {rz: reg}   => 0b010010 @ rx @ ry @ rz @ 0b0
    and {rx: reg}, {ry: reg}              => asm { and {rx}, {rx}, {ry} }
    or {rx: reg}, {ry: reg}, {rz: reg}    => 0b010011 @ rx @ ry @ rz @ 0b0
    or {rx: reg}, {ry: reg}               => asm { or {rx}, {rx}, {ry} }
    xor {rx: reg}, {ry: reg}, {rz: reg}   => 0b010100 @ rx @ ry @ rz @ 0b0
    xor {rx: reg}, {ry: reg}              => asm { xor {rx}, {rx}, {ry} }
    
    not {rx: reg}, {ry: reg}              => 0b010101 @ rx @ ry @ 0b0000
    not {rx: reg}                         => asm { not {rx}, {rx}, {ry} }
    
    rotl {rx: reg}, #{n: u4}              => 0b010000 @ rx @ 0b100 @ n
    rotr {rx: reg}, #{n: u4}              => 0b010000 @ rx @ 0b110 @ n
    
    shiftl0 {rx: reg}, #{n: u4}           => 0b010000 @ rx @ 0b000 @ n
    shiftl1 {rx: reg}, #{n: u4}           => 0b010000 @ rx @ 0b001 @ n
    shiftr0 {rx: reg}, #{n: u4}           => 0b010000 @ rx @ 0b010 @ n
    shiftr1 {rx: reg}, #{n: u4}           => 0b010000 @ rx @ 0b011 @ n
    
    cmp {rx: reg}, {ry: reg}              => 0b010110 @ rx @ ry @ 0b0000
    
    ; IO
    inchar {rx: reg}                      => 0b110101 @ rx @ 0b0000000
    outchar {rx: reg}, {ry: reg}          => 0b110010 @ rx @ ry @ 0b0000
    
    ; Jump
    jmp {end: addr}                       => 0b000010 @ 0b0000 @ 0b000000 @ end
    jeq {end: addr}                       => 0b000010 @ 0b0001 @ 0b000000 @ end
    jne {end: addr}                       => 0b000010 @ 0b0010 @ 0b000000 @ end
    jz {end: addr}                        => 0b000010 @ 0b0011 @ 0b000000 @ end
    jnz {end: addr}                       => 0b000010 @ 0b0100 @ 0b000000 @ end
    jc {end: addr}                        => 0b000010 @ 0b0101 @ 0b000000 @ end
    jnc {end: addr}                       => 0b000010 @ 0b0110 @ 0b000000 @ end
    jgr {end: addr}                       => 0b000010 @ 0b0111 @ 0b000000 @ end
    jle {end: addr}                       => 0b000010 @ 0b1000 @ 0b000000 @ end
    jeg {end: addr}                       => 0b000010 @ 0b1001 @ 0b000000 @ end
    jel {end: addr}                       => 0b000010 @ 0b1010 @ 0b000000 @ end
    jov {end: addr}                       => 0b000010 @ 0b1011 @ 0b000000 @ end
    jnov {end: addr}                      => 0b000010 @ 0b1100 @ 0b000000 @ end
    jn {end: addr}                        => 0b000010 @ 0b1101 @ 0b000000 @ end
    jdz {end: addr}                       => 0b000010 @ 0b1110 @ 0b000000 @ end
    
    ; Call
    call {end: addr}                      => 0b000011 @ 0b0000 @ 0b000000 @ end
    ceq {end: addr}                       => 0b000011 @ 0b0001 @ 0b000000 @ end
    cne {end: addr}                       => 0b000011 @ 0b0010 @ 0b000000 @ end
    cz {end: addr}                        => 0b000011 @ 0b0011 @ 0b000000 @ end
    cnz {end: addr}                       => 0b000011 @ 0b0100 @ 0b000000 @ end
    cc {end: addr}                        => 0b000011 @ 0b0101 @ 0b000000 @ end
    cnc {end: addr}                       => 0b000011 @ 0b0110 @ 0b000000 @ end
    cgr {end: addr}                       => 0b000011 @ 0b0111 @ 0b000000 @ end
    cle {end: addr}                       => 0b000011 @ 0b1000 @ 0b000000 @ end
    ceg {end: addr}                       => 0b000011 @ 0b1001 @ 0b000000 @ end
    cel {end: addr}                       => 0b000011 @ 0b1010 @ 0b000000 @ end
    cov {end: addr}                       => 0b000011 @ 0b1011 @ 0b000000 @ end
    cnov {end: addr}                      => 0b000011 @ 0b1100 @ 0b000000 @ end
    cn {end: addr}                        => 0b000011 @ 0b1101 @ 0b000000 @ end
    cdz {end: addr}                       => 0b000011 @ 0b1110 @ 0b000000 @ end

    rts                                   => 0b000100 @ 0b0000000000

    ; Stack
    push {rx: reg}                        => 0b000101 @ rx @ 0b0000000
    push {ri: ireg}                       => 0b000101 @ 0b0001 @ ri

    pop {rx: reg}                         => 0b000110 @ rx @ 0b0000000
    pop {ri: ireg}                        => 0b000110 @ 0b0001 @ ri

    ; Control
    clearc                                => 0b001000 @ 0b0000000000
    setc                                  => 0b001000 @ 0b1000000000

    halt                                  => 0b001111 @ 0b0000000000
    nop                                   => 0b000000 @ 0b0000000000
    noop                                  => 0b000000 @ 0b0000000000
    breakp                                => 0b001110 @ 0b0000000000
}

#ruledef utils
{
    var #{n: u16}                         =>
    {
        (0x0000)`(16 * n)
    }

    string {value}                        =>
    {
        utf16be(value)
    }
}

#bankdef main
{
    #bits 16
    #labelalign 16
    #addr 0x0000
    #size 0x10000
    #outp 0
    #fill
}
