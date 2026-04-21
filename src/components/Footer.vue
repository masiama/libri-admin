<template>
  <footer class="border-default shrink-0 border-t">
    <div class="flex h-12 items-center justify-between gap-3 px-4 py-2">
      <div class="text-muted text-xs">Copyright © {{ new Date().getFullYear() }} Libri</div>
      <div class="flex items-center gap-3">
        <slot name="controls" />
      </div>
    </div>
  </footer>
</template>
