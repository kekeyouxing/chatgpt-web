import { useWritingStore } from '@/store'

export function useWriting() {
  const writingStore = useWritingStore()

  const addWriting = (uuid: number, writingData: Writing.WritingData) => {
    writingStore.addWritingByUuid(uuid, writingData)
  }

  const updateWriting = (uuid: number, writingData: Writing.WritingData) => {
    writingStore.updateWritingByUuid(uuid, writingData)
  }

  const updateWritingSome = (uuid: number, writingData: Partial<Writing.WritingData>) => {
    writingStore.updateWritingSomeByUuid(uuid, writingData)
  }

  return {
    addWriting,
    updateWriting,
    updateWritingSome,
  }
}
