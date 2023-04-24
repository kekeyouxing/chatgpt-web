<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import OrdinaryCardComponent from './components/Ordinary/index.vue'
import VIPCardComponent from './components/Vip/index.vue'
import { fetchMenuConfig } from '@/api'
import { useBasicLayout } from '@/hooks/useBasicLayout'
const { isMobile } = useBasicLayout()
const ms = useMessage()
interface Card {
  title: string
  description: string
  cardCategory: number
  cardType: number
}
interface MenuState {
  card: Card[]
}

const loading = ref(false)

const config = ref<MenuState>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchMenuConfig<MenuState>()
    config.value = data
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    loading.value = false
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <div
    class="flex flex-row"
    :class="[isMobile ? 'gap-2 p-2' : 'gap-6 p-6']"
  >
    <OrdinaryCardComponent />
    <VIPCardComponent />
  </div>
</template>
