import type { IWebsocketResponse } from '@/types/websocket';
import { TypeUserEnum } from '@/enums/game';
import { TypeResponseEnum, TypeInteractionEnum } from '@/enums/websocket';
import { useWebSocket } from '@vueuse/core';

// Conexão WebSocket
const connection_url = `ws://localhost:3000/api/websocket?userType=${TypeUserEnum.PLAYER}`;

// Algoritmo BFS com WebSocket
export async function breadthFirstSearchWorker(roomId: string) {
  const { data, send, close } = useWebSocket(`${connection_url}&room=${roomId}&userName=bfs`);

  let workerId = '';
  const visited = new Set<string>();
  const queue: { x: number; y: number; path: string[] }[] = [];
  let lastPosition = { x: 0, y: 0 }; // Última posição do personagem

  queue.push({ x: 0, y: 0, path: [] });
  visited.add('0,0');

  watch(data, (value) => {
    if (!value) return;
    const response: IWebsocketResponse = JSON.parse(value);

    switch (response.type) {
      case TypeResponseEnum.YOUR_PLAYER:
        workerId = response.userId;
        break;
      case TypeResponseEnum.MOVE_PLAYER:
        if (workerId === response.userId) {
          lastPosition = response.data.position;
        }
        if (response.interactions[TypeInteractionEnum.REACHED_GOAL]) {
          console.log('Goal reached:', response.data.position);
          close();
          return;
        }
        break;
    }
  });

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    const { x, y, path } = current;

    // Movimentos possíveis
    const directions = [
      { dx: 0, dy: -1, dir: 'top' },
      { dx: -1, dy: 0, dir: 'left' },
      { dx: 0, dy: 1, dir: 'down' },
      { dx: 1, dy: 0, dir: 'right' },
    ];

    for (const { dx, dy, dir } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const newKey = `${newX},${newY}`;

      // Verifica se o novo ponto está dentro dos limites e ainda não foi visitado
      if (
        newX >= 0 &&
        newX < 10 && // Limites horizontais
        newY >= 0 &&
        newY < 10 && // Limites verticais
        !visited.has(newKey)
      ) {
        visited.add(newKey);
        queue.push({ x: newX, y: newY, path: [...path, dir] });

        // Retorna à última posição antes de seguir para o novo ponto
        const reversePath = path.slice().reverse().map((step) => {
          if (step === 'top') return 'down';
          if (step === 'down') return 'top';
          if (step === 'left') return 'right';
          if (step === 'right') return 'left';
        });

        for (const step of reversePath) {
          if (step) {
            send(step); // Volta ao ponto anterior
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Move para o novo ponto
        send(dir);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Atualiza a última posição
        lastPosition = { x: newX, y: newY };
      }
    }
  }

  console.log('BFS completed.');
  close();
}


// Algoritmo DFS com WebSocket
export async function depthFirstSearchWorker(roomId: string) {
  const { data, send, close } = useWebSocket(`${connection_url}&room=${roomId}&userName=dfs`)

  let workerId = ''
  let currentPosition = { x: 0, y: 0 } // Posição inicial
  const visited = new Set<string>()
  const stack: { x: number; y: number; path: string[] }[] = []

  stack.push({ x: 0, y: 0, path: [] })
  visited.add('0,0')

  watch(data, (value) => {
    if (!value) return
    const response: IWebsocketResponse = JSON.parse(value)

    switch (response.type) {
      case TypeResponseEnum.YOUR_PLAYER:
        workerId = response.userId
        break
      case TypeResponseEnum.MOVE_PLAYER:
        if (workerId === response.userId) {
          currentPosition = response.data.position
        }
        if (response.interactions[TypeInteractionEnum.REACHED_GOAL]) {
          console.log('Goal reached:', response.data.position)
          close()
          return
        }
        break
    }
  })

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) break

    const { x, y, path } = current

    // Movimentos possíveis
    const directions = [
      { dx: 0, dy: -1, dir: 'top' },
      { dx: -1, dy: 0, dir: 'left' },
      { dx: 0, dy: 1, dir: 'down' },
      { dx: 1, dy: 0, dir: 'right' },
    ]

    for (const { dx, dy, dir } of directions) {
      const newX = x + dx
      const newY = y + dy
      const newKey = `${newX},${newY}`

      if (!visited.has(newKey)) {
        visited.add(newKey)
        stack.push({ x: newX, y: newY, path: [...path, dir] })

        // Move para a nova célula
        for (const step of path) {
          send(step) // Volta ao ponto de partida
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        send(dir) // Move para o novo ponto
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }

  console.log('DFS completed.')
  close()
}
