#include "icmc.asm"

; Teste das instrucoes que vao sendo implementadas!


; 4 Perguntas ao implemantar as instrucoes:
;	1) O Que preciso fazer para esta instrucao?
;	2) Onde Comeca: Pegargcc o que tem que fazer e ir voltando ate' chegar em um registrador (ie. PC)
;	3) Qual e' a Sequencia de Operacoes: Descrever todos os comandos que tem que dar nos cilos de Dec e Exec
;	4) Ja' terminou??? Cumpriu o que tinha que fazer??? O PC esta' pronto para a proxima instrucao (cuidado com Load, load, Store, Jmp, Call)

	; Teste do load
	load r0, #0		
	load r1, #"A"		
	write r1, r0	
	
	; Teste do Load	
	load r0, #2
	load r1, Dado
	write r1, r0
	
	; Teste do Store
	load r1, #"C"
	store Dado, r1
	load r2, Dado
	load r0, #4
	write r2, r0
	
	; Teste do store e load
	load r1, #Dado
	load r0, #"D"
	store r1, r0
	load r2, r1
	load r0, #6
	write r2, r0
	
	; Teste do Move
	load r1, #"E"
	mov r2, r1
	load r0, #8
	write r2, r0
	
	; Teste do Add
	load r1, #"E"
	load r2, #1
	add r3, r1, r2
	load r0, #10
	write r3, r0		; Printa F na linha 10
	
	; Teste do Sub
	load r1, #"H"
	load r2, #1
	sub r3, r1, r2
	load r0, #12
	write r3, r0		; Printa G na linha 12

	; Teste do Mult
	load r1, #3
	load r2, #2
	mul r3, r1, r2
	load r4, #"B"
	add r3, r4, r3
	load r0, #14
	write r3, r0		; Printa H na linha 14

	; Teste do Div
	load r1, #6
	load r2, #2
	div r3, r1, r2
	load r4, #"F"
	add r3, r4, r3
	load r0, #16
	write r3, r0		; Printa I na linha 16

	; Teste do Inc / Dec
	load r0, #18
	load r3, #"K"
	inc r3
	dec r3
	dec r3
	write r3, r0		; Printa J na linha 18
	
	; Teste do And
	load r1, #254
	load r2, #5
	and r3, r1, r2
	load r4, #"G"
	add r3, r4, r3
	load r0, #20
	write r3, r0		; Printa K na linha 20
	
	; Teste do Or
	load r1, #4
	load r2, #3
	or r3, r1, r2
	load r4, #"E"
	add r3, r4, r3
	load r0, #22
	write r3, r0		; Printa L na linha 22
	
	; Teste do Xor
	load r1, #5
	load r2, #3
	xor r3, r1, r2
	load r4, #"G"
	add r3, r4, r3
	load r0, #24
	write r3, r0		; Printa M na linha 24
	
	; Teste do CMP e JMP
	load r0, #26
	load r1, #5
	load r2, #3
	load r3, #"X"
	load r4, #"N"
	cmp r1, r2
	jmp.gt Maior
	write r3, r0		; Printa O na linha 26
	jmp SaiJMP
Maior:
	write r4, r0		; Printa N na linha 26
	jmp SaiJMP
	
SaiJMP:

	; Teste do CALL e ret
	load r0, #28
	load r1, #5
	load r2, #3
	load r3, #"O"
	load r4, #"X"
	cmp r1, r2
	call.gt CallMaior
	call.le CallMenorIgual
	jmp CallSai
CallMaior:
	write r3, r0		; Printa O na linha 28
	ret
CallMenorIgual:
	write r4, r0		; Printa X na linha 28
	ret

CallSai:	

	; Teste do PUSH e POP
	load r0, #30
	load r1, #"P"
	push r1
	pop r2
	write r2, r0		; Printa P na linha 30

	
Fim:	
	hlt

	
Dado :
        #d16 "B"
