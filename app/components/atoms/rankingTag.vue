<template>
  <div class="font-sk-font-pixel flex w-full items-center justify-between">
    <IconArrowRight v-if="isMe" class="fill-sk-color-border absolute -ml-10" />
    <div class="flex items-center gap-3 bg-black">
      <div
        class="py-1 ps-2"
        :class="typeMapping[number]?.textClass || 'text-sk-color-border'"
      >
        1
      </div>
      <div
        class="rounded-l px-2 py-1"
        :class="
          typeMapping[number]?.bgClass || 'text-sk-color-border bg-gray-900'
        "
      >
        {{ name }}
      </div>
    </div>
    <div v-if="isInformed" class="text-sk-color-border">Informado</div>
    <div v-else class="text-sk-color-border">Não informado</div>
    <div class="text-sk-color-border">{{ iterations }} iterações</div>
  </div>
</template>

<script setup lang="ts">
import IconArrowRight from '@/public/assets/icons/icon-arrow-right.svg'

defineProps({
  number: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  iterations: {
    type: Number,
    required: true,
  },
  isInformed: {
    type: Boolean,
    required: true,
  },
  isMe: {
    type: Boolean,
    default: false,
  },
})

const typeMapping: {
  [key: number]: {
    bgClass: string
    textClass: string
  }
} = {
  0: {
    bgClass: 'bg-sk-color-gold',
    textClass: 'text-sk-color-gold',
  },
  1: {
    bgClass: 'bg-sk-color-bronze',
    textClass: 'text-sk-color-bronze',
  },
  2: {
    bgClass: 'bg-sk-color-border',
    textClass: 'text-sk-color-border',
  },
}
</script>
