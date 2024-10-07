<template>
  <NuxtLayout>
    <div class="flex w-full flex-col gap-5">
      <AtomsButton :to="`/game/${gameRoomId}`">
        {{ $t('general.play') }}
      </AtomsButton>
      <AtomsButton to="/about"> {{ $t('general.about') }} </AtomsButton>
      <AtomsButton to="https://www.linkedin.com/in/andre2654/" target="_blank">
        {{ $t('general.linkedin') }}
      </AtomsButton>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

const gameRoomId = uuidv4()
</script>
