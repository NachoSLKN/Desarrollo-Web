import Typography from "@mui/material/Typography"
import { useQuestionsData } from "./hooks/useQuestionsData"
import Button from "@mui/material/Button/Button"
import { useQuestionsStore } from "./store/questions"

export function Footer() {

  const { correct, incorrect, unanswered } = useQuestionsData(state => state)
  const reset = useQuestionsStore(state => state.reset)

  return (
    <footer style={{ marginTop: '24px', textAlign: 'center' }}>
      <Typography>
        ✅ {correct} correctas - ❌ {incorrect} incorrectas - ⏳ {unanswered} sin responder
      </Typography>


        <Button onClick={() => reset()} > 
            Resetear
        </Button>


    </footer>


  )
}