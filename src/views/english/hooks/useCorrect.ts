import { useCorrectStore } from '@/store'

export function useCorrect() {
  const correctStore = useCorrectStore()

  const addCorrect = (uuid: number, correct: Correct.CorrectData) => {
    correctStore.addCorrectByUuid(uuid, correct)
  }

  const updateCorrect = (uuid: number, correct: Correct.CorrectData) => {
    correctStore.updateCorrectByUuid(uuid, correct)
  }

  const updateCorrectSome = (uuid: number, correct: Partial<Correct.CorrectData>) => {
    correctStore.updateCorrectSomeByUuid(uuid, correct)
  }

  return {
    addCorrect,
    updateCorrect,
    updateCorrectSome,
  }
}
