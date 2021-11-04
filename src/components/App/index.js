import { Add, AddShoppingCart, ChevronLeft, Close, CloudDownload, Delete, Remove,} from '@mui/icons-material'
import {  Avatar, Button, ButtonGroup, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, SwipeableDrawer, TextField, Toolbar, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {AccountBalanceWallet} from '@mui/icons-material'
import { fetchFromStorage, saveToStorage } from '../../utils/storage'
import QrReader from 'react-qr-reader'
import axiosInstance from '../../utils/axios'

function ScannerApp() {
    const cart = fetchFromStorage('cart')
    const [items, setItems] = useState( cart || [])
    const [openScan, setOpenScan] = useState(false)
    
    const handleCartChange = (cart) => {
        setItems(cart)
    }

    const handleRemove = (id) => {
        const filtered_cart = cart.filter(a => a._id !== id)
        setItems(filtered_cart)
        saveToStorage('cart', filtered_cart)
    }
    return (
        <div style={{minHeight: '100vh'}}>

            <div style={{margin: "20px 0px", textAlign: 'center'}}>
                <Typography variant="h6" style={{textAlign: 'left', marginLeft: 20, fontWeight: 600}}>
                    Welcome to MGJ Shop
                </Typography>
                <div style={{width: 200, margin: '20px auto 10px', textAlign: 'center',}}>
                    <img src="./images/mainQR.png" alt="mainQR" style={{height: 170,borderRadius: 10}}
                        onClick={() => setOpenScan(!openScan)}
                    />
                    <Typography variant="caption" color="GrayText" component="p">Click on the QR Code to start scanning.</Typography>
                </div>
                <Button variant="contained" size="large" startIcon={<AccountBalanceWallet />} style={{borderRadius: 20}}>Pay Now</Button>
            </div>
            <ScanDrawer open={openScan} onClose={() => setOpenScan(!openScan)} onOpen={() => setOpenScan(!openScan)} onChange={handleCartChange} />

            <div style={{
                    minHeight: 'inherit',
                    padding: 10, 
                    background: '#391463', borderTopLeftRadius: 20, borderTopRightRadius: 20,}}>
                <Typography variant="h6" style={{color: '#fff'}}>Your Cart</Typography>
                <List>
                    {items.length < 1 && (
                        <ListItem>
                            <ListItemText 
                                primary="Your cart is empty"
                                secondary={
                                    <Typography variant="caption" color="GrayText">
                                            Click on QR to start shopping.
                                    </Typography>
                                }
                            />
                        </ListItem>
                    )}
                    {items.map((item, index) => (
                        <CartItem key={index} item={item} removeItem={handleRemove} />
                    ))}
                </List>
            </div>
        </div>
    )
}

const CartItem = ({item, removeItem}) => {
    const [remove, setRemove] = useState(false)
    const price = parseFloat(item.initialPrice) + parseFloat(item.markupPrice)
    const handleRemove = (id) => {
        removeItem(id)
        setRemove(false)
    }
    return (
        <ListItem 
            style={{background: '#fff', marginBottom: 10, borderRadius: 10}}
            secondaryAction={
                <IconButton onClick={() => setRemove(true)}>
                    <Delete />
                </IconButton>
            }
        >
            <ListItemButton dense>
                <ListItemAvatar>
                    <Avatar variant="rounded" src={item.media[0]}>
                        <CloudDownload />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={item.name}
                    secondary={
                        <Typography variant="caption" color="GrayText">
                            Php{(price).toFixed(2)} x {item.quantity} pc/s
                        </Typography>
                    }
                />
            </ListItemButton>
            <SwipeableDrawer anchor="bottom" open={remove} onOpen={() => setRemove(!remove)} onClose={() => setRemove(!remove)}>
                <div style={{padding: 20}}>
                    <Typography variant="h6">Remove Item?</Typography>
                    <Typography variant="subtitle2">Are you sure you want to remove {item.name} from your cart?</Typography>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20}}>
                        <Button variant="outlined" onClick={() => setRemove(false)}>Cancel</Button>
                        <Button variant="contained" color="secondary" onClick={() => handleRemove(item._id)} startIcon={<Delete />}>Remove</Button>
                    </div>
                </div>
            </SwipeableDrawer>
        </ListItem>
    )
}

const ScanDrawer = ({open, onClose, onOpen, onChange}) => {
    const [product, setProduct] = useState(null)

    const getProduct = React.useCallback(async(id) =>{
        console.log(id)
        if(id) {
            const {data} = await axiosInstance.get(`/products/${id}`)
            console.log(data)
            setProduct(data.product)
        }
    },[])

    const handleScan = (id) => {
        getProduct(id)
    }
    useEffect(() => {
        setProduct(null)
    }, [])
    return (
        <SwipeableDrawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            onOpen={onOpen}
            PaperProps={{
                style: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                }
            }}
        >
            <div style={{height: '90vh', padding: '5vw'}}>
                {!product ? (
                    <React.Fragment>
                        <div style={{padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant="h6">Scan Your Product</Typography>
                            <IconButton onClick={onClose}><Close /></IconButton>
                        </div>
                        <div>
                            <QrReader
                                delay={300}
                                onError={(err) => console.log(err)}
                                onScan={handleScan}
                                style={{ width: "100%" }}
                                />
                        </div>
                    </React.Fragment>
                ): (
                    <React.Fragment>
                        <div style={{padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <IconButton onClick={() => setProduct(null)} size="large"><ChevronLeft /></IconButton>
                        </div>
                        <ProductDetails item={product} onClose={onClose} onChange={onChange}/>
                    </React.Fragment>
                )}
            </div>
        </SwipeableDrawer>
    )
}

const ProductDetails = ({item, onClose, onChange}) => {
    const price = parseFloat(item.initialPrice) + parseFloat(item.markupPrice)
    const [quantity, setQuantity] = useState(1)

    const handleRemove = () => {
        if (quantity < 2) {
            return onClose()
        }
        setQuantity(quantity - 1)
    }

    const handleAddToCart = () => {
        const cart = fetchFromStorage('cart')
        item.quantity = quantity
        let new_cart = []
        if (!cart) {
            new_cart = [item]
        }else{
            new_cart = [...cart, item]
        }
        saveToStorage('cart', new_cart)
        onChange(new_cart)
        onClose()
    }
    return (
        <div>
            <img src={item.media[0]} alt={item.name} style={{width: "90vw", height: 340, backgroundSize: 'cover', borderRadius: 10, border: 'solid 1px #e1e1e1'}}/>
            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 20}}>
                <div>
                    <Typography variant="h5" style={{fontWeight: 'bold'}}>{item.name}</Typography>
                    <Typography variant="subtitle1" component="p" color="GrayText">{item.description}</Typography>
                </div>
                <Typography variant="h6">Php {price.toFixed(2)}</Typography>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: "20px 0px"}}>
                <Typography variant="h6">Quantity</Typography>
                <div>
                    <ButtonGroup size="small">
                        <Button onClick={handleRemove}><Remove /></Button>
                        <Button disabled style={{fontSize: 15, color: '#000'}}>{quantity}</Button>
                        <Button onClick={() => setQuantity(quantity + 1)}><Add /></Button>
                    </ButtonGroup>
                </div>
            </div>
            <Divider />
            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: "20px 0px"}}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">Php {(parseFloat(price) * parseInt(quantity)).toFixed(2)}</Typography>
            </div>
            <div>
                <Button fullWidth style={{borderRadius: 20}} size="large" variant="contained" startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                >Add To Cart</Button>
            </div>
        </div>
    )
}
export default ScannerApp