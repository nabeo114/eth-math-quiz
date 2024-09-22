import React from 'react';
import { Container, Box, Card, CardContent, Typography } from '@mui/material';
import Metamask from './components/Metamask';

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h4">Metamask</Typography>
            <Metamask />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default App;
