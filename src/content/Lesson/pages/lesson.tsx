import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useNavigate, useParams } from "react-router-dom";
import { Problem } from "../components";
import http from "../../../api";
import { AnswerPropsType, ProblemPropsType } from "../types/ProblemProps";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    padding: "100px",
    backgroundColor: "rgb(20, 26, 31)",
    minHeight: "calc(100vh - 200px)",
  },
  paper: {
    position: "relative",
    borderRadius: "10px",
    padding: "50px 100px",
    backgroundColor: "white",
    width: "800px",
    minWidth: "400px",
    display: "flex",
    flexDirection: "column",
  },
  returnButton: {
    "&.css-k012qr-MuiButtonBase-root-MuiButton-root": {
      position: "absolute",
      top: "50px",
      right: "80px",
      backgroundColor: theme.palette.secondary.main
    },
    "&.css-k012qr-MuiButtonBase-root-MuiButton-root:hover": {
      backgroundColor: theme.palette.secondary.light
    }
  },
  problemField: {
    "&.css-32q0xd-MuiGrid-root": {
      marginTop: "30px",
    },
  },
  submitButton: {},
}));

const LessonPage = () => {
  const classes = useStyles();

  const { lessonId } = useParams<{ lessonId: string }>();
  const [problems, setProblems] = useState<ProblemPropsType[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [answer, setAnswer] = useState<AnswerPropsType[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    http
      .request({
        url: `${process.env.REACT_APP_API_URL}/api/questions/${lessonId}/`,
        method: "get",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(({ data }) => {
        setProblems(data.questions);
        let tmp: AnswerPropsType[] = data.questions.map(
          (item: ProblemPropsType) => ({
            question: item.id,
            choices: [],
          })
        );
        setAnswer(tmp);
      })
      .catch((err) => {});
  }, [lessonId]);

  const [isAnyQuestionAnswered, setIsAnyQuestionAnswered] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Assuming you have an API endpoint to submit answers and get a score
    http
      .request({
        url: `${process.env.REACT_APP_API_URL}/api/submit-answers/`,
        method: "post",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ answers: answer }),
      })
      .then(({ data }) => {
        setScore(data.total);
        setIsSubmitted(true);
      })
      .catch((err) => {});
  };

  const handleAnswerChange = (
    questionIndex: number,
    newAnswer: AnswerPropsType
  ) => {
    setAnswer((prevAnswer) => {
      const updatedAnswers = [...prevAnswer];
      updatedAnswers[questionIndex] = newAnswer;

      // Check if at least one question has been answered
      const isAnswered = updatedAnswers.some(
        (item: AnswerPropsType) => item.choices.length > 0
      );
      setIsAnyQuestionAnswered(isAnswered);

      return updatedAnswers;
    });
  };

  const handleReturn = () => {
    navigate("/home");
  }
  return (
    <div className={classes.root}>
      <Box className={classes.paper}>
        <Typography variant="h4">{"Class" + lessonId}</Typography>
        <Button className={classes.returnButton} variant="contained" onClick={handleReturn}>Return</Button>

        <form onSubmit={handleSubmit}>
          <Grid
            className={classes.problemField}
            container
            spacing={3}
            direction={"column"}
          >
            {problems.map((problem: ProblemPropsType, index) => (
              <Problem
                key={index}
                index={index}
                question={problem.question_text}
                choices={problem.choice}
                type={problem.is_multi}
                selectedAnswer={answer[index]}
                handleAnswerChange={handleAnswerChange}
                isSubmitted={isSubmitted}
              />
            ))}
            <Grid item alignSelf={"flex-end"}>
              <Button
                type="submit"
                variant="contained"
                disabled={!isAnyQuestionAnswered || isSubmitted}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
        {score !== null && (
          <Typography variant="h6">Your score: {score}</Typography>
        )}
      </Box>
    </div>
  );
};

export default LessonPage;
