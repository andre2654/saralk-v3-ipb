<template>
  <div class="flex w-full max-w-[400px] flex-col items-center gap-5">
    <AtomsButton to="/game/start" class="w-full">
      {{ $t('general.play') }}
    </AtomsButton>
    <AtomsButton to="/about" class="w-full">
      {{ $t('general.about') }}
    </AtomsButton>
    <AtomsButton
      to="https://www.linkedin.com/in/andre2654/"
      target="_blank"
      class="w-full"
    >
      {{ $t('general.linkedin') }}
    </AtomsButton>
  </div>
</template>
