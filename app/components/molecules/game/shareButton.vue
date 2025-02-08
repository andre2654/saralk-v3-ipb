<template>
  <AtomsLink
    class="mr-auto cursor-pointer fill-white hover:fill-sk-color-primary"
    @click="copyRoomId"
  >
    <div v-if="copying">Copiado!</div>
    <div v-else class="flex items-center gap-2">
      Copiar id da sala <IconShare class="h-5 w-5" />
    </div>
  </AtomsLink>
</template>

<script setup lang="ts">
import IconShare from '@/public/assets/icons/icon-share.svg'

const props = defineProps<{
  roomId: string
}>()

const copying = ref(false)

function copyToClipboard(content: string) {
  const el = document.createElement('textarea')
  el.value = content
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

const copyRoomId = () => {
  copying.value = true
  copyToClipboard(props.roomId)

  setTimeout(() => {
    copying.value = false
  }, 1000)
}
</script>
