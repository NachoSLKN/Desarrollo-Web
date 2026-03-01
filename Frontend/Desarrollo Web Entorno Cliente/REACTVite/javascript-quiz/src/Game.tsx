import { Card, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import { useQuestionsStore } from './store/questions'
import { type Question as QuestionType } from './types/types'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Footer } from "./Footer";



const Question = ({ info }: { info: QuestionType }) => {
    const selectAnswer = useQuestionsStore(state => state.selectAnswer)
    //Función que se crea una vez.
    const getBackGroundColor = (index: number) => {
        const { userSelectedAnswer, correctAnswer } = info
        if (userSelectedAnswer == null) {
            return 'transparent'
        }
        // Respuesta correcta siempre verde
        if (index === correctAnswer) {
            return '#00ff00'
        }
        // Si falló, marcar la suya en rojo
        if (index === userSelectedAnswer) {
            return '#ff0000'
        }
        return 'transparent'
    }

    const createHanldeClick = (answerIndex: number) => () => {
        selectAnswer(info.id, answerIndex)
    }
    return (
        <Card variant='outlined' sx={{ padding: 2, textAlign: 'left' }}>

            <Typography variant='h5'>
                {info.question}
            </Typography>

            <SyntaxHighlighter language="javascript" style={darcula}>
                {info.code}
            </SyntaxHighlighter>


            <List sx={{ bgcolor: '#333' }} disablePadding>

                {info.answers.map((answer, index) => (
                    <ListItem key={index} disablePadding divider>
                        <ListItemButton
                            disabled={info.userSelectedAnswer != null}
                            onClick={createHanldeClick(index)}
                            sx={{ bgcolor: getBackGroundColor(index) }}>

                            <ListItemText primary={answer} />
                        </ListItemButton>
                    </ListItem>
                ))
                }

            </List>

        </Card>
    )
}

export const Game = () => {
    const questions = useQuestionsStore(state => state.questions)
    const currentQuestion = useQuestionsStore(state => state.currentQuestion)


    const goNextQuestion = useQuestionsStore(state => state.goNextQuestion)
    const goPreviousQuestion = useQuestionsStore(state => state.goPreviousQuestion)




    const questionInfo = questions[currentQuestion]


    return (
        <>
            <Stack direction='row' justifyContent='center' alignItems='center' spacing={2} mb={2}>
                <IconButton
                    onClick={goPreviousQuestion}
                    disabled={currentQuestion === 0}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>

                <Typography>
                    {currentQuestion + 1} / {questions.length}
                </Typography>

                <IconButton
                    onClick={goNextQuestion}
                    disabled={currentQuestion === questions.length - 1}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </Stack>
            <Question info={questionInfo} />
            <Footer />
        </>



    )
}