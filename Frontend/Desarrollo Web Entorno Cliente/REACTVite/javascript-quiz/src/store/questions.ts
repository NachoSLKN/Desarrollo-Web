import { create } from 'zustand'
import type { Question } from '../types/types'
import confetti from 'canvas-confetti'
import { persist } from 'zustand/middleware'

interface State {
  questions: Question[]
  currentQuestion: number
  fetchQuestions: (limit: number) => Promise<void>
  selectAnswer: (questionId: number, answerIndex: number) => void
  goNextQuestion: () => void
  goPreviousQuestion: () => void
  reset: () => void   // 👈 AÑADIR AQUÍ
}

export const useQuestionsStore = create<State>()(
  persist(
    (set, get) => ({

      questions: [],
      currentQuestion: 0,

      fetchQuestions: async (limit: number) => {
        console.log("Fetching questions...", limit)

        const response = await fetch(`https://opentdb.com/api.php?amount=${limit}`)
        const data = await response.json()

        const questions: Question[] = data.results.map((q: any, index: number) => {
          const answers = [...q.incorrect_answers, q.correct_answer]
            .sort(() => Math.random() - 0.5)

          return {
            id: index,
            question: q.question,
            code: "",
            answers,
            correctAnswer: answers.indexOf(q.correct_answer)
          }
        })

        set({ questions })
      },

      selectAnswer: (questionId: number, answerIndex: number) => {
        const { questions } = get()
        const newQuestions = structuredClone(questions)

        const questionIndex = newQuestions.findIndex(q => q.id === questionId)
        const questionInfo = newQuestions[questionIndex]

        if (questionInfo.userSelectedAnswer != null) return

        const isCorrectUserAnswer = questionInfo.correctAnswer === answerIndex

        newQuestions[questionIndex] = {
          ...questionInfo,
          isCorrectUserAnswer,
          userSelectedAnswer: answerIndex
        }

        set({ questions: newQuestions })

        if (isCorrectUserAnswer) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          })
        }
      },

      goNextQuestion: () => {
        const { currentQuestion, questions } = get()
        const nextQuestion = currentQuestion + 1

        if (nextQuestion < questions.length) {
          set({ currentQuestion: nextQuestion })
        }
      },

      goPreviousQuestion: () => {
        const { currentQuestion } = get()
        const previousQuestion = currentQuestion - 1

        if (previousQuestion >= 0) {
          set({ currentQuestion: previousQuestion })
        }
      },

      reset: () => {
        set({ currentQuestion: 0, questions: [] })
      }

    }),
    {
      name: 'questions'
    }
  )
)