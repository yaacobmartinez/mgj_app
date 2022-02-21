import { Button, Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'
import SwipeableViews from 'react-swipeable-views';

function SplashScreen() {
    return (
        <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems : 'center', textAlign: 'center', padding: 20}}>

                <SwipeableViews enableMouseEvents>
                    <div>
                        <img src="./purchase.png" style={{height: 200, width: 'auto', marginBottom: 30}} alt="logo"/>
                        <Typography variant="h6">Purchasing Product thru QR Code</Typography>
                        <Typography variant="caption" color="GrayText">You can purchase products and immediately compute everything you buy through Qr scanning features.</Typography>
                    </div>
                    <div>
                        <img src="./payment.png" style={{height: 200, width: 'auto', marginBottom: 30}} alt="logo"/>
                        <Typography variant="h6">Online or Cash Payment</Typography>
                        <Typography variant="caption" color="GrayText">
                        To make our purchase more convenient, we have prepared
                        online payment features through gcash, but if you do not have gcash,
                        you can pay through cashier and present the QR code so that you can 
                        see your digital receipt automatically.
                        </Typography>
                        <br />
                        {/* <Button 
                            variant="contained" 
                            color="primary" 
                            style={{position: 'fixed', bottom: 20, left: 20, width: '90vw'}} size="large" component={Link} to="/app">Let's Get Started</Button> */}
                    </div>
                    <div>
                        <img src="./quantity.png" style={{height: 200, width: 'auto', marginBottom: 30}} alt="logo"/>
                        <Typography variant="h6">Product Remove & Quantity Guide</Typography>
                        <Typography variant="caption" color="GrayText">
                            To make it easier to remove and add quantity, just slide the screen from right to left to see the remove button, & from left to right to see the quantity.
                        </Typography>
                    </div>
                    <div>
                        <img src="./logo.png" style={{height: 150, width: 'auto', marginBottom: 30}} alt="logo"/>
                        <Typography variant="h6">Shop with Convenience</Typography>
                        <Button 
                            variant="contained" 
                            color="primary" size="large" component={Link} to="/app">Let's Get Started</Button>
                    </div>
                </SwipeableViews>
            
            
        </div>
    )
}

export default SplashScreen
