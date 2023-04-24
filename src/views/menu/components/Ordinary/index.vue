<script lang="ts" setup>
interface Props {
  title?: string
  description?: string
}
</script>

<template>
  <div class="hover:bg-slate-100 cursor-pointer relative items-start justify-between rounded-2xl border p-2 shadow-xl sm:p-4 lg:p-6 max-w-xs">
    <div class="text-gray-500 ">
      <h3 class="text-lg font-bold text-gray-900 sm:text-xl">
        英语纠错
      </h3>
      <p class="mt-2 hidden text-gray-500 text-sm sm:block">
        你可以输入一段英文，静等片刻，帮您实现纠错。
      </p>
    </div>
  </div>
</template>
