#once

#subruledef reg
{
    r{n: u3} => n
}

#subruledef addr
{
    {n: u16} => n
}

#ruledef mnemonics
{
    ; Memory
    store {end: addr}, {rx: reg}          => 0b110001 @ rx @ 0b0000000 @ end
    store {rx: reg}, {ry: reg}            => 0b111101 @ rx @ ry @ 0b0000
    
    load {rx: reg}, {end: addr}           => 0b110000 @ rx @ 0b0000000 @ end
    load {rx: reg}, {ry: reg}             => 0b111100 @ rx @ ry @ 0b0000
    load {rx: reg}, #{value: i16}         => 0b111000 @ rx @ 0b0000000 @ value
    
    ; Move
    mov {rx: reg}, {ry: reg}              => 0b110011 @ rx @ ry @ 0b0000
    mov {rx: reg}, sp                     => 0b110011 @ rx @ 0b0000001
    mov sp, {rx: reg}                     => 0b110011 @ rx @ 0b0000011
    
    ; ULA
    add {rx: reg}, {ry: reg}, {rz: reg}   => 0b100000 @ rx @ ry @ rz @ 0b0
    add {rx: reg}, {ry: reg}              => 0b100000 @ rx @ rx @ ry @ 0b0
    addc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100000 @ rx @ ry @ rz @ 0b1
    addc {rx: reg}, {ry: reg}             => 0b100000 @ rx @ rx @ ry @ 0b1
    
    sub {rx: reg}, {ry: reg}, {rz: reg}   => 0b100001 @ rx @ ry @ rz @ 0b0
    sub {rx: reg}, {ry: reg}              => 0b100001 @ rx @ rx @ ry @ 0b0
    subc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100001 @ rx @ ry @ rz @ 0b1
    subc {rx: reg}, {ry: reg}             => 0b100001 @ rx @ rx @ ry @ 0b1
    
    mul {rx: reg}, {ry: reg}, {rz: reg}   => 0b100010 @ rx @ ry @ rz @ 0b0
    mul {rx: reg}, {ry: reg}              => 0b100010 @ rx @ rx @ ry @ 0b0
    mulc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100010 @ rx @ ry @ rz @ 0b1
    mulc {rx: reg}, {ry: reg}             => 0b100010 @ rx @ rx @ ry @ 0b1
    
    div {rx: reg}, {ry: reg}, {rz: reg}   => 0b100011 @ rx @ ry @ rz @ 0b0
    div {rx: reg}, {ry: reg}              => 0b100011 @ rx @ rx @ ry @ 0b0
    divc {rx: reg}, {ry: reg}, {rz: reg}  => 0b100011 @ rx @ ry @ rz @ 0b1
    divc {rx: reg}, {ry: reg}             => 0b100011 @ rx @ rx @ ry @ 0b1
    
    rem {rx: reg}, {ry: reg}, {rz: reg}   => 0b100101 @ rx @ ry @ rz @ 0b0
    rem {rx: reg}, {ry: reg}              => 0b100101 @ rx @ rx @ ry @ 0b0
    
    inc {rx: reg}                         => 0b100100 @ rx @ 0b0000000
    dec {rx: reg}                         => 0b100100 @ rx @ 0b1000000

    ; ARITH
    and {rx: reg}, {ry: reg}, {rz: reg}   => 0b010010 @ rx @ ry @ rz @ 0b0
    and {rx: reg}, {ry: reg}              => 0b010010 @ rx @ rx @ ry @ 0b0
    or {rx: reg}, {ry: reg}, {rz: reg}    => 0b010011 @ rx @ ry @ rz @ 0b0
    or {rx: reg}, {ry: reg}               => 0b010011 @ rx @ rx @ ry @ 0b0
    xor {rx: reg}, {ry: reg}, {rz: reg}   => 0b010100 @ rx @ ry @ rz @ 0b0
    xor {rx: reg}, {ry: reg}              => 0b010100 @ rx @ rx @ ry @ 0b0
    
    not {rx: reg}, {ry: reg}              => 0b010101 @ rx @ ry @ 0b0000
    not {rx: reg}                         => 0b010101 @ rx @ rx @ 0b0000
    
    rol {rx: reg}, #{value: u4}           => 0b010000 @ rx @ 0b100 @ value
    ror {rx: reg}, #{value: u4}           => 0b010000 @ rx @ 0b110 @ value
    
    shl {rx: reg}, #{v: u4}, #{b: u1}     => 0b010000 @ rx @ 0b00 @ b @ v
    shr {rx: reg}, #{v: u4}, #{b: u1}     => 0b010000 @ rx @ 0b01 @ b @ v
    
    cmp {rx: reg}, {ry: reg}              => 0b010110 @ rx @ ry @ 0b0000
    
    ; IO
    read {rx: reg}                        => 0b110101 @ rx @ 0b0000000
    write {rx: reg}, {ry: reg}            => 0b110010 @ rx @ ry @ 0b0000
    
    ; Jump
    jmp {end: addr}                       => 0b000010 @ 0b0000 @ 0b000000 @ end
    jmp.eq {end: addr}                    => 0b000010 @ 0b0001 @ 0b000000 @ end
    jmp.neq {end: addr}                   => 0b000010 @ 0b0010 @ 0b000000 @ end
    jmp.z {end: addr}                     => 0b000010 @ 0b0011 @ 0b000000 @ end
    jmp.nz {end: addr}                    => 0b000010 @ 0b0100 @ 0b000000 @ end
    jmp.c {end: addr}                     => 0b000010 @ 0b0101 @ 0b000000 @ end
    jmp.nc {end: addr}                    => 0b000010 @ 0b0110 @ 0b000000 @ end
    jmp.gt {end: addr}                    => 0b000010 @ 0b0111 @ 0b000000 @ end
    jmp.lt {end: addr}                    => 0b000010 @ 0b1000 @ 0b000000 @ end
    jmp.ge {end: addr}                    => 0b000010 @ 0b1001 @ 0b000000 @ end
    jmp.le {end: addr}                    => 0b000010 @ 0b1010 @ 0b000000 @ end
    jmp.o {end: addr}                     => 0b000010 @ 0b1011 @ 0b000000 @ end
    jmp.no {end: addr}                    => 0b000010 @ 0b1100 @ 0b000000 @ end
    jmp.neg {end: addr}                   => 0b000010 @ 0b1101 @ 0b000000 @ end
    jmp.dz {end: addr}                    => 0b000010 @ 0b1110 @ 0b000000 @ end
    
    ; Call
    call {end: addr}                      => 0b000011 @ 0b0000 @ 0b000000 @ end
    call.eq {end: addr}                   => 0b000011 @ 0b0001 @ 0b000000 @ end
    call.neq {end: addr}                  => 0b000011 @ 0b0010 @ 0b000000 @ end
    call.z {end: addr}                    => 0b000011 @ 0b0011 @ 0b000000 @ end
    call.nz {end: addr}                   => 0b000011 @ 0b0100 @ 0b000000 @ end
    call.c {end: addr}                    => 0b000011 @ 0b0101 @ 0b000000 @ end
    call.nc {end: addr}                   => 0b000011 @ 0b0110 @ 0b000000 @ end
    call.gt {end: addr}                   => 0b000011 @ 0b0111 @ 0b000000 @ end
    call.lt {end: addr}                   => 0b000011 @ 0b1000 @ 0b000000 @ end
    call.ge {end: addr}                   => 0b000011 @ 0b1001 @ 0b000000 @ end
    call.le {end: addr}                   => 0b000011 @ 0b1010 @ 0b000000 @ end
    call.o {end: addr}                    => 0b000011 @ 0b1011 @ 0b000000 @ end
    call.no {end: addr}                   => 0b000011 @ 0b1100 @ 0b000000 @ end
    call.neg {end: addr}                  => 0b000011 @ 0b1101 @ 0b000000 @ end
    call.dz {end: addr}                   => 0b000011 @ 0b1110 @ 0b000000 @ end

    ret                                   => 0b000100 @ 0b0000000000

    ; Stack
    push {rx: reg}                        => 0b000101 @ rx @ 0b0000000
    push fr                               => 0b000101 @ rx @ 0b1000000

    pop {rx: reg}                         => 0b000110 @ rx @ 0b0000000
    pop fr                                => 0b000110 @ rx @ 0b1000000

    ; Control
    setc #{b: u1}                         => 0b001000 @ b @ 0b000000000

    hlt                                   => 0b001111 @ 0b0000000000
    nop                                   => 0b000000 @ 0b0000000000
    bkpt                                  => 0b001110 @ 0b0000000000

    ; Utils
    string {value}                        => {
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
