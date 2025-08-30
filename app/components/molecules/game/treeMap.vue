<template>
  <div
    class="fixed left-0 top-0 z-10 flex h-full w-full flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800"
  >
    <!-- Header com gradiente -->
    <div class="bg-gradient-to-r from-[#d5ad57] to-[#c17428] p-6 shadow-2xl">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="mb-2 text-2xl font-bold text-white">GRAFO</h1>
          <p class="text-sm text-orange-100">
            Player:
            <span class="font-semibold">{{
              characterStore.currentPlayer?.name || 'No player'
            }}</span>
            | Positions:
            <span class="font-semibold">{{
              characterStore.currentPlayer?.positionsHistory?.length || 0
            }}</span>
          </p>
        </div>
        <button
          @click="emits('close')"
          class="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white shadow-lg transition-all hover:scale-105"
        >
          ❌ Close
        </button>
      </div>
    </div>

    <!-- Controles -->
    <div class="border-b border-gray-700 bg-gray-800/80 p-4 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Layout Controls -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-300">Layout:</span>
          <button
            @click="updateLayout('LR')"
            :class="[
              'rounded-md px-3 py-1 text-xs transition-all duration-200',
              currentLayout === 'LR'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            ]"
          >
            ↔️ Horizontal
          </button>
          <button
            @click="updateLayout('TB')"
            :class="[
              'rounded-md px-3 py-1 text-xs transition-all duration-200',
              currentLayout === 'TB'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            ]"
          >
            ↕️ Vertical
          </button>
        </div>

        <!-- Zoom Controls -->
        <div class="flex min-w-[300px] flex-1 items-center gap-3">
          <span class="text-sm font-medium text-gray-300">🔍 Zoom:</span>
          <input
            v-model.number="zoomLevel"
            type="range"
            min="0.1"
            max="16"
            step="0.1"
            class="slider h-2 max-w-xs flex-1 cursor-pointer appearance-none rounded-lg bg-gray-700"
          />
          <span class="min-w-[50px] font-mono text-sm text-orange-400"
            >{{ zoomLevel.toFixed(1) }}x</span
          >
          <button
            @click="resetZoom"
            class="rounded bg-gray-600 px-2 py-1 text-xs text-gray-200 transition-colors hover:bg-gray-500"
          >
            🔄 Reset
          </button>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-4 text-xs text-gray-400">
          <span>📍 Nodes: {{ Object.keys(computedNodes).length }}</span>
          <span>🔗 Edges: {{ Object.keys(computedEdges).length }}</span>
        </div>
      </div>
    </div>

    <!-- Graph Area -->
    <div class="relative flex-1 overflow-hidden">
      <VNetworkGraph
        ref="graph"
        v-model:zoom-level="zoomLevel"
        class="graph h-full w-full"
        :nodes="computedNodes"
        :edges="computedEdges"
        :layouts="layouts"
        :configs="configs"
      />

      <!-- Loading/Empty State -->
      <div
        v-if="!characterStore.currentPlayer?.positionsHistory?.length"
        class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="text-center">
          <div class="mb-4 text-6xl">🚶‍♂️</div>
          <h3 class="mb-2 text-xl text-white">No Movement History</h3>
          <p class="text-gray-400">
            Start moving to see your path visualization
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as vNG from 'v-network-graph'
import { VNetworkGraph } from 'v-network-graph'
import 'v-network-graph/lib/style.css'
import dagre from 'dagre'
import type { Nodes, Edges, Layouts } from 'v-network-graph'
import type { IPosition, IBlock } from '@/types/game'
import { GameBlockTypeEnum } from '@/enums/game'

const characterStore = useCharacterStore()

const nodeSize = 40
const zoomLevel = ref(1.5)
const currentLayout = ref<'TB' | 'LR'>('TB')

// Função para resetar o zoom
function resetZoom() {
  zoomLevel.value = 1.0
}

// Função para obter cores baseadas no tipo do bloco
function getBlockColors(blockType: GameBlockTypeEnum) {
  switch (blockType) {
    case GameBlockTypeEnum.GRASSY_1:
    case GameBlockTypeEnum.GRASSY_2:
      return {
        primary: '#5bea83',
        secondary: '#27d758',
        border: '#0e9d1d',
      }
    case GameBlockTypeEnum.ROCKY_1:
    case GameBlockTypeEnum.ROCKY_2:
      return {
        primary: '#cbc8c8',
        secondary: '#b2aaaa',
        border: '#7d7d7d',
      }
    case GameBlockTypeEnum.SANDY_1:
    case GameBlockTypeEnum.SANDY_2:
      return {
        primary: '#d8ce78',
        secondary: '#c5ba5d',
        border: '#89771a',
      }
    case GameBlockTypeEnum.SWAMPY_1:
    case GameBlockTypeEnum.SWAMPY_2:
      return {
        primary: '#5e7b09',
        secondary: '#495c10',
        border: '#404d1d',
      }
    case GameBlockTypeEnum.GOAL:
      return {
        primary: '#FFD700',
        secondary: '#FFA500',
        border: '#FF8C00',
      }
    default:
      return {
        primary: '#666666',
        secondary: '#555555',
        border: '#444444',
      }
  }
}

// Computed para gerar nós automaticamente do histórico
const computedNodes = computed<Nodes>(() => {
  const player = characterStore.currentPlayer
  if (!player?.positionsHistory || player.positionsHistory.length === 0) {
    return {}
  }

  const newNodes: Nodes = {}
  const positionToNodeId = new Map<string, string>()

  // Gerar nós apenas para posições únicas
  player.positionsHistory.forEach((block: IBlock, index: number) => {
    const positionKey = `${block.position.x},${block.position.y}`

    // Se esta posição ainda não foi criada como nó
    if (!positionToNodeId.has(positionKey)) {
      const nodeId = `pos_${positionKey}`
      positionToNodeId.set(positionKey, nodeId)

      const blockColors = getBlockColors(block.type)

      newNodes[nodeId] = {
        name: `(${block.position.x},${block.position.y})`,
        position: { x: block.position.x, y: block.position.y },
        blockType: block.type,
        blockColors: blockColors,
        isBlocked: block.isBlocked,
        step: index,
        visits: 1,
        points: block.points,
      }
    } else {
      // Se já existe, incrementa o contador de visitas
      const nodeId = positionToNodeId.get(positionKey)!
      if (newNodes[nodeId]) {
        newNodes[nodeId].visits = (newNodes[nodeId].visits || 1) + 1
        // Atualiza o nome para mostrar quantas vezes foi visitado
        newNodes[nodeId].name =
          `(${block.position.x},${block.position.y}) x${newNodes[nodeId].visits}`
      }
    }
  })

  return newNodes
})

// Computed para gerar arestas automaticamente do histórico
const computedEdges = computed<Edges>(() => {
  const player = characterStore.currentPlayer
  if (!player?.positionsHistory || player.positionsHistory.length === 0) {
    return {}
  }

  const newEdges: Edges = {}
  const positionToNodeId = new Map<string, string>()

  // Primeiro, mapear todas as posições para seus IDs de nó
  player.positionsHistory.forEach((block: IBlock) => {
    const positionKey = `${block.position.x},${block.position.y}`
    if (!positionToNodeId.has(positionKey)) {
      const nodeId = `pos_${positionKey}`
      positionToNodeId.set(positionKey, nodeId)
    }
  })

  // Gerar arestas conectando o caminho percorrido
  for (let i = 0; i < player.positionsHistory.length - 1; i++) {
    const currentPos = player.positionsHistory[i]
    const nextPos = player.positionsHistory[i + 1]

    const currentPosKey = `${currentPos.position.x},${currentPos.position.y}`
    const nextPosKey = `${nextPos.position.x},${nextPos.position.y}`

    const sourceNodeId = positionToNodeId.get(currentPosKey)!
    const targetNodeId = positionToNodeId.get(nextPosKey)!

    // Criar ID único para a aresta baseado no índice do movimento
    const edgeId = `move_${i}`

    newEdges[edgeId] = {
      source: sourceNodeId,
      target: targetNodeId,
    }
  }

  return newEdges
})

const nodes: Nodes = reactive({})
const edges: Edges = reactive({})

const layouts: Layouts = reactive({
  nodes: {},
})

const configs = vNG.defineConfigs({
  view: {
    autoPanAndZoomOnLoad: 'fit-content',
    onBeforeInitialDisplay: () => layout('TB'),
    scalingObjects: true,
    minZoomLevel: 0.1,
    maxZoomLevel: 16,
  },
  node: {
    selectable: true,
    normal: {
      type: (node) => {
        // Nós bloqueados ficam com forma diferente
        if (node.isBlocked) return 'rect'
        // Destacar nós visitados múltiplas vezes com círculo
        return node.visits && node.visits > 1 ? 'circle' : 'rect'
      },
      width: (node) => {
        // Nós visitados múltiplas vezes ficam maiores
        return node.visits && node.visits > 1 ? 80 : 60
      },
      height: 40,
      borderRadius: 8,
      color: (node) => {
        if (!node.blockColors) return '#666666'

        // Se o nó foi visitado múltiplas vezes, usa cor secundária
        if (node.visits && node.visits > 1) {
          return node.blockColors.secondary
        }

        // Se o bloco está bloqueado, usa uma versão mais escura
        if (node.isBlocked) {
          return node.blockColors.border
        }

        // Cor normal do bloco
        return node.blockColors.primary
      },
      strokeWidth: 2,
      strokeColor: (node) => {
        return node.blockColors?.border || '#333333'
      },
    },
    hover: {
      color: (node) => {
        return node.blockColors?.secondary || '#555555'
      },
      width: (node) => {
        return node.visits && node.visits > 1 ? 84 : 64
      },
      height: 44,
      borderRadius: 8,
      strokeWidth: 3,
    },
    label: {
      fontSize: 10,
      color: '#ffffff',
      direction: 'center',
      fontWeight: 'bold',
      text: (node) => {
        // Mostra emoji especial para diferentes tipos de bloco
        let emoji = ''
        if (node.blockType === 'goal') emoji = '🎯'
        else if (node.isBlocked) emoji = '🚫'
        else if (node.visits > 1) emoji = '🔄'
        else if (node.points > 0) emoji = '💰'

        return `${emoji}\n${node.name}`
      },
    },
  },
  edge: {
    normal: {
      width: 2,
      color: '#ff6f00',
      linecap: 'round',
    },
    hover: {
      color: '#ff5500',
    },
    marker: {
      target: {
        type: 'arrow',
        width: 8,
        height: 8,
      },
    },
  },
})

const graph = ref<vNG.VNetworkGraphInstance>()

function layout(direction: 'TB' | 'LR') {
  const nodesToUse = computedNodes.value
  const edgesToUse = computedEdges.value

  if (
    Object.keys(nodesToUse).length <= 1 ||
    Object.keys(edgesToUse).length == 0
  ) {
    return
  }

  // convert graph
  // ref: https://github.com/dagrejs/dagre/wiki
  const g = new dagre.graphlib.Graph()
  // Set an object for the graph label
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSize * 2,
    edgesep: nodeSize,
    ranksep: nodeSize * 2,
  })
  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.
  Object.entries(nodesToUse).forEach(([nodeId, node]) => {
    g.setNode(nodeId, { label: node.name, width: nodeSize, height: nodeSize })
  })

  // Add edges to the graph.
  Object.values(edgesToUse).forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  g.nodes().forEach((nodeId: string) => {
    // update node position
    const x = g.node(nodeId).x
    const y = g.node(nodeId).y
    layouts.nodes[nodeId] = { x, y }
  })
}

function updateLayout(direction: 'TB' | 'LR') {
  currentLayout.value = direction
  // Animates the movement of an element.
  graph.value?.transitionWhile(() => {
    layout(direction)
  })
}

// Watcher para atualizar layout automaticamente quando os dados mudam
watch(
  [computedNodes, computedEdges],
  () => {
    nextTick(() => {
      layout(currentLayout.value)
    })
  },
  { deep: true }
)

const emits = defineEmits(['close'])
</script>

<style scoped>
/* Estilo customizado para o slider */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6f00, #ff8f00);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 8px rgba(255, 111, 0, 0.3);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(255, 111, 0, 0.4);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6f00, #ff8f00);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 8px rgba(255, 111, 0, 0.3);
}

.slider::-webkit-slider-track {
  height: 8px;
  cursor: pointer;
  background: linear-gradient(90deg, #374151, #4b5563);
  border-radius: 5px;
  border: 1px solid #6b7280;
}

.slider::-moz-range-track {
  height: 8px;
  cursor: pointer;
  background: linear-gradient(90deg, #374151, #4b5563);
  border-radius: 5px;
  border: 1px solid #6b7280;
}

.slider:focus {
  outline: none;
}

.slider:focus::-webkit-slider-track {
  background: linear-gradient(90deg, #4b5563, #6b7280);
}

/* Animação para os botões */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Gradiente animado para o fundo */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

/* Estilo para o estado de loading */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Estilo para o grafo */
.graph {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(31, 41, 55, 0.8) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border-radius: 0 0 1rem 1rem;
}

/* Efeito de brilho para estatísticas */
.text-orange-400 {
  text-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
}

/* Backdrop blur personalizado */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
</style>
