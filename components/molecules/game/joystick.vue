<template>
  <div class="flex flex-col items-center justify-center gap-1">
    <AtomsButton @click="moveUp"> oi</AtomsButton>
    <div class="flex items-center gap-1">
      <AtomsButton @click="moveLeft"> oi</AtomsButton>
      <AtomsButton> oi</AtomsButton>
      <AtomsButton @click="moveRight"> oi</AtomsButton>
    </div>
    <AtomsButton @click="moveDown"> oi</AtomsButton>
  </div>
</template>

<script setup lang="ts">
const { moveUp, moveLeft, moveRight, moveDown } = useCharacterStore()
</script>
