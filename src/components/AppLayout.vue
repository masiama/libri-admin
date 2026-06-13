<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden">
    <Header>
      <template #controls>
        <slot name="header-controls" />
      </template>
    </Header>

    <main class="grow overflow-hidden">
      <slot />
    </main>

    <Footer>
      <template #controls>
        <slot name="footer-controls" />
      </template>
    </Footer>
  </div>
</template>
