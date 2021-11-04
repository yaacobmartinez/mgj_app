import { MenuOpen } from '@mui/icons-material'
import { AppBar, IconButton, Toolbar } from '@mui/material'
import React from 'react'

function CustomAppBar() {
    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} style = {{background: '#474549'}}>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <MenuOpen />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}

export default CustomAppBar
