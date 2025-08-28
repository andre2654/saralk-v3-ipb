# Documentação WebSocket - Saralk Game

## URL de Conexão
```
wss://[host]/api/websocket?room=[roomId]&userName=[userName]&userType=[player|spectator]&userId=[userId]
```

### Parâmetros da URL
- `room` (obrigatório): ID da sala do jogo
- `userName` (opcional): Nome do usuário
- `userType` (opcional): Tipo do usuário - `player` ou `spectator` (padrão: `player`)
- `userId` (opcional): ID único do usuário (se não fornecido, usa o peerId)

---

## Eventos do Cliente → Servidor

### 1. Movimentação
**Comandos**: `top`, `left`, `right`, `down`
- Move o jogador na direção especificada
- **Regras**:
  - Timeout de 350ms entre movimentos
  - Só funciona se o bloco adjacente não estiver bloqueado
  - Espectadores podem atravessar blocos bloqueados
  - Jogadores que alcançaram o objetivo não podem se mover

### 2. Obter Informações do Tabuleiro
**Comando**: `getBoardInfo`
- Solicita informações completas do tabuleiro (com heurísticas)
- Marca o jogador como "informado"
- Retorna o tabuleiro completo com custos e distâncias

### 3. Heartbeat
**Comando**: `heartbeat`
- Mantém a conexão ativa
- Não gera resposta

---

## Eventos do Servidor → Cliente

### 1. NEW_PLAYER
Notifica quando um novo jogador entra na sala
```json
{
  "type": "newPlayer",
  "userId": "string",
  "data": "IPlayer"
}
```

### 2. YOUR_PLAYER
Enviado para o jogador que acabou de se conectar
```json
{
  "type": "yourPlayer",
  "userId": "string",
  "data": "IPlayer",
  "currentBlock": "IBlock",
  "adjacentBlocks": "IAdjacentBlocks"
}
```

### 3. GAME_INFO
Informações gerais do jogo
```json
{
  "type": "gameInfo",
  "data": "IGame"
}
```

### 4. MOVE_PLAYER
Notifica movimento de um jogador
```json
{
  "type": "movePlayer",
  "userId": "string",
  "direction": "ActionMoveEnum",
  "interactions": "IInteractions",
  "data": "IPlayer",
  "currentBlock": "IBlock",
  "adjacentBlocks": "IAdjacentBlocks"
}
```

### 5. REMOVE_PLAYER
Notifica quando um jogador sai da sala
```json
{
  "type": "removePlayer",
  "userId": "string"
}
```

### 6. BOARD_INFO
Resposta ao comando `getBoardInfo`
```json
{
  "type": "boardInfo",
  "board": "IBoard",
  "userId": "string"
}
```

### 7. INVALID_ACTION
Erro de validação
```json
{
  "type": "invalidAction",
  "userId": "string",
  "message": "string"
}
```

---

## Regras de Negócio

### Movimentação
- **Timeout**: 350ms entre movimentos consecutivos
- **Bloqueios**: Jogadores não podem atravessar blocos bloqueados
- **Espectadores**: Podem atravessar qualquer bloco
- **Objetivo Alcançado**: Jogadores param de se mover

### Pontuação
- Jogadores ganham pontos ao pisarem em blocos com pontuação
- Pontos são zerados do bloco após coleta
- Espectadores não coletam pontos

### Informações do Tabuleiro
- **Jogadores Não-Informados**: Veem tabuleiro sem heurísticas
- **Jogadores Informados**: Veem tabuleiro completo com custos e distâncias
- **Comando getBoardInfo**: Transforma jogador em "informado"

### Persistência
- Dados do jogo são salvos no MongoDB
- Jogadores mantêm estado entre desconexões
- Status `inGame` controla presença ativa

### Interações Especiais
- **REACHED_GOAL**: Jogador alcança o objetivo
- **GET_POINTS**: Jogador coleta pontos de um bloco

---

## Tipos de Usuário

### PLAYER
- Pode se mover pelo tabuleiro
- Coleta pontos
- Não pode atravessar blocos bloqueados
- Para ao alcançar o objetivo

### SPECTATOR
- Pode se mover livremente
- Não coleta pontos
- Pode atravessar blocos bloqueados
- Não tem restrições de objetivo

---

## Estados da Conexão

### Conexão (open)
1. Valida parâmetros da URL
2. Cria/recupera sala do jogo
3. Cria/recupera jogador
4. Envia eventos iniciais: `GAME_INFO`, `NEW_PLAYER`, `YOUR_PLAYER`

### Desconexão (close)
1. Marca jogador como `inGame: false`
2. Notifica outros jogadores com `REMOVE_PLAYER`
3. Mantém dados do jogador para reconexão

### Erro (error)
- Loga erro no servidor
- Conexão pode ser encerrada dependendo do erro
