import { Button, Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

function SplashScreen() {
    return (
        <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems : 'center', textAlign: 'center', padding: 10}}>

            <div>
                <img src="./logo.png" style={{height: 150, width: 'auto', marginBottom: 30}} alt="logo"/>
                <Typography variant="h6">Welcome to MGJ Food Trading</Typography>
                <Typography variant="caption">Shop with Convenience</Typography>
                <br />
                <Button 
                    variant="contained" 
                    color="primary" 
                    style={{position: 'fixed', bottom: 20, left: 20, width: '90vw'}} size="large" component={Link} to="/app">Let's Get Started</Button>
            </div>
            
        </div>
    )
}

export default SplashScreen
