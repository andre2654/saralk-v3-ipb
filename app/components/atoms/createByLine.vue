<template>
  <div class="flex min-w-[500px] items-center justify-center gap-6">
    <hr class="h-0.5 w-full bg-white max-sm:hidden" />
    <div class="font-sk-font-pixel min-w-fit text-[14px] text-white">
      {{ $t('credits.createBy') }} {{ $t('credits.authorFirstName') }}
      <span class="text-sk-color-primary">{{
        $t('credits.authorLastName')
      }}</span>
    </div>
    <hr class="h-0.5 w-full bg-white max-sm:hidden" />
  </div>
</template>
