import React from 'react';
import { Container, Box, Card, CardContent, Typography } from '@mui/material';
import Metamask from './components/Metamask';
import Contracts from './components/Contracts';
import MathQuiz from './components/MathQuiz';

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Metamask</Typography>
            <Metamask />
            <Contracts />
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Math Quiz</Typography>
            <MathQuiz />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default App;
