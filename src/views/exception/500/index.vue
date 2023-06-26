<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="grid h-screen px-4 bg-white place-content-center">
    <h1 class="tracking-widest text-gray-500 uppercase">
      500 | Server Error | <span
        class="text-gray-500 underline"
        @click="goHome"
      >Go home <span /></span>
    </h1>
  </div>
</template>
