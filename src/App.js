import './App.css';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress, Box, Snackbar, Alert } from '@mui/material';
import he from 'he';


const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);


  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=21&difficulty=medium&type=multiple');
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data.results.map((q) => ({
          ...q,
          question: he.decode(q.question),
          correctAnswer: he.decode(q.correct_answer),
          answers: shuffleArray([...q.incorrect_answers.map(a => he.decode(a)), he.decode(q.correct_answer)])
        })));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerSelect = (answer) => {
    const correct = answer === questions[currentQuestionIndex].correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setSnackbarOpen(true); 
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer('');
    setIsCorrect(null);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (currentQuestionIndex >= questions.length) {
    return <Typography variant="h4" sx={{ textAlign: 'center' }}>You've completed the trivia!</Typography>;
  }

  const { question, correctAnswer, answers } = questions[currentQuestionIndex];

  return (

    
    <div style={{ padding: '20px' }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {question}
          </Typography>
          <div>
            {answers.map((answer, index) => (
              <Button
                key={index}
                variant="contained"
                color={selectedAnswer === answer ? (isCorrect ? 'success' : 'error') : 'primary'}
                onClick={() => handleAnswerSelect(answer)}
                disabled={!!selectedAnswer}
                style={{ margin: '5px' }}
              >
                {answer}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      {selectedAnswer && (
        <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleNextQuestion}>
            Next Question
          </Button>
        </Box>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
      <Alert onClose={handleSnackbarClose} severity={isCorrect ? 'success' : 'error'}>
        {isCorrect ? 'Correct answer!' : 'Wrong answer!'}
      </Alert>
      </Snackbar>
    </div>
  );
}

export default App;

