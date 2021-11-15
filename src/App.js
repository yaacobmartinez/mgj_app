import { createTheme, ThemeProvider } from '@mui/material';
import { orange } from '@mui/material/colors';
import React from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import ScannerApp from './components/App';
import Scanner from './components/Scanner';
import SplashScreen from './components/SplashScreen';
import Summary from './components/Summary';
import './index.css'
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins'
  },
  status: {
    danger: orange[500],
  },
});

function App() {
  return (
    <div>
      <Router>
        <ThemeProvider theme={theme}>
        <Switch>
          <Route exact path="/" component={SplashScreen}/>
          <Route exact path="/app" component={ScannerApp}/>
          <Route exact path="/scanner" component={Scanner}/>
          <Route exact path="/summary" component={Summary}/>
        </Switch>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;
