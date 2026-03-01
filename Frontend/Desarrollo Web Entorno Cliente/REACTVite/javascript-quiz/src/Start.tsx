import { Button } from "@mui/material";
import { use } from "react";
import { useQuestionsStore } from "./store/questions";

const LIMIT_QUESTIONS = 10


export const Start = () => {
    const fetchQuestions = useQuestionsStore(state => state.fetchQuestions)
    

    const handleClick = async () => {
        fetchQuestions(5)

    }




    return (
        <Button 
            onClick={handleClick}
            variant="contained"
        >
            ¡Empezar!
        </Button>
    );
};