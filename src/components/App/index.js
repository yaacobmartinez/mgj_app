import { Add, AddShoppingCart, ChevronLeft, Close, CloudDownload, Delete, Receipt, Refresh, Remove,} from '@mui/icons-material'
import {  AppBar, Avatar, Button, ButtonGroup, Dialog, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, SwipeableDrawer, Toolbar, Typography } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import {AccountBalanceWallet} from '@mui/icons-material'
import { fetchFromStorage, saveToStorage, clearStorage } from '../../utils/storage'
import QrReader from 'react-qr-reader'
import axiosInstance from '../../utils/axios'
import { totalReducer } from '../../utils'
import QRCode from 'qrcode.react'

function ScannerApp() {
    const cart = fetchFromStorage('cart')
    const [items, setItems] = useState( cart || [])
    const [openScan, setOpenScan] = useState(false)
    const [openPayment, setOpenPayment] = useState(false)
    const handleCartChange = (cart) => {
        setItems(cart)
    }

    const handleRemove = (id) => {
        const filtered_cart = cart.filter(a => a._id !== id)
        setItems(filtered_cart)
        saveToStorage('cart', filtered_cart)
    }

    useEffect(() => {
        setItems(cart)
    }, [])
    
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
                <Button 
                    disabled={ cart ? cart?.length < 1 : true}
                    variant="contained" size="large" startIcon={<AccountBalanceWallet />} style={{borderRadius: 20}}
                    onClick={() => setOpenPayment(true)}
                >Pay Now</Button>
            </div>
            <ScanDrawer open={openScan} onClose={() => setOpenScan(!openScan)} onOpen={() => setOpenScan(!openScan)} onChange={handleCartChange} />
            {openPayment && (
                <PaymentDialog open={openPayment} onClose={() => setOpenPayment(false)} />
            )}
            <div style={{
                    minHeight: 'inherit',
                    padding: 10, 
                    background: '#391463', borderTopLeftRadius: 20, borderTopRightRadius: 20,}}>
                <Typography variant="h6" style={{color: '#fff'}}>Your Cart</Typography>
                <List>
                    {(cart?.length < 1 || !cart )&& (
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
                    {cart?.map((item, index) => (
                        <CartItem key={index} item={item} removeItem={handleRemove} />
                    ))}
                </List>
            </div>
            <div style={{position: 'fixed', bottom: 0, width: '100vw', background: '#fff'}}>
                <List>
                    <ListItem secondaryAction={
                        <Typography variant="h6">Php {cart ? parseFloat(cart?.reduce(totalReducer, 0)).toFixed(2) : `0.00`}</Typography>
                    }>
                        <ListItemText 
                            primary={<Typography variant="h6">Total</Typography>} 
                            secondary={<Typography variant="caption">{cart ? cart?.length : 0} items in cart</Typography>}
                        />
                    </ListItem>
                </List>
            </div>
        </div>
    )
}

const PaymentDialog = ({open, onClose}) => {
    const cart = fetchFromStorage('cart')
    const [paymentDetails, setPaymentDetails] = useState(null)
    
    const createPaymentIntent = useCallback(async() => {
        if (!cart) return
        if (cart?.length < 1) return 
        const order_details = {
            total: cart?.reduce(totalReducer, 0),
            cart
        }
        const {data} = await axiosInstance.post(`/orders`, order_details)
        console.log(data)
        setPaymentDetails(data.order) 
    }, [cart])

    useEffect(() => {
        let mounted = true
        if (mounted) {
            console.log(1)
            createPaymentIntent()
        }
        return () => mounted = false
    }, [])

    const handleRefresh = async () => {
        const {data} = await axiosInstance.get(`/orders/${paymentDetails._id}`)
        console.log(data)
        setPaymentDetails(data.order)
    }

    const handleFinishTransaction = () => {
        onClose()
        saveToStorage('cart', [])
    }
    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    {/* <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                    >
                        <Close />
                    </IconButton> */}
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {paymentDetails?.status !== 0 ? 'Transaction Details' : 'Waiting for Payment'}
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={paymentDetails?.status !== 0 ? handleFinishTransaction : handleRefresh}
                        aria-label="close"
                    >
                        {paymentDetails?.status !== 0 ? (
                            <Close />
                        ):(
                            <Refresh />
                        )}
                    </IconButton>
                </Toolbar>
            </AppBar>

            {paymentDetails?.status === 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 10, margin: 10, 
                    border: 'solid 1px #e1e1e1', borderRadius: 10
                }}>
                    <Typography variant="body2" component="h6" style={{textAlign: 'center', fontWeight: 'bold'}} gutterBottom>
                        Instructions: Present to the cashier and pay the amount due.
                    </Typography>
                    <div style={{width: '80%'}}>
                        <Typography style={{fontSize: 18}}>Total</Typography>
                        <Typography style={{fontWeight: 'bold', fontSize: 50}}>₱ {(paymentDetails.total).toFixed(2)}</Typography>
                    </div>
                    <Typography style={{fontSize: 24}} gutterBottom>Status: {paymentDetails.status === 0 ? 'Pending' : 'Paid'}</Typography>
                    <QRCode value={paymentDetails._id} size={256}/>
                </div>
                // <pre>{JSON.stringify(paymentDetails, null, 4)}</pre>
            ): (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 10, margin: 10, 
                border: 'solid 1px #e1e1e1', borderRadius: 10
            }}>
                    <Typography variant="h6" component="h6">
                        Reference Number
                    </Typography>
                    {/* <QRCode value={paymentDetails?._id} size={128}/> */}
                    <Typography variant="caption" component="h6" gutterBottom>
                        {paymentDetails?._id}
                    </Typography>
                    <Typography variant="body2" component="h6" style={{fontWeight: 'bold'}}>
                        Your Cart Items
                    </Typography>
                    {paymentDetails?.cart.map((item, index) => (
                        <CartItem item={item} removeItem={() => console.log(1)} hasRemove={false} key={index}/>
                    ))}
                    {/* <pre>{JSON.stringify(paymentDetails?.cart, null, 1)}</pre> */}
                    <div style={{display: 'flex', alignItems: 'center', justifyContent:'space-between', width: '80%', marginBottom: 20}}>
                        <Typography variant="caption" component="h6" style={{fontWeight: 'bold', fontSize: 20}}>
                            Total
                        </Typography>
                        <Typography variant="caption" component="h6" style={{fontWeight: 'bold', fontSize: 20}}>
                            ₱ {(paymentDetails?.total)?.toFixed(2)}
                        </Typography>
                    </div>
                    {/* <Button variant="contained" size="small" fullWidth onClick={onClose} startIcon={<Receipt />}>Save Transaction</Button> */}
                </div>
            )}
        </Dialog> 
    )   
}

const CartItem = ({item, removeItem, hasRemove=true}) => {
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
                hasRemove ? 
                <IconButton onClick={() => setRemove(true)}>
                    <Delete />
                </IconButton>
                : null
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
        // if cart is empty
        if (!cart) {
            //create a new cart and put item
            new_cart = [item]
        }else{
            // check if cart has product 
            const hasProduct = cart.filter(a => a._id === item._id)
            if (hasProduct.length > 0) {
                // console.log(hasProduct)
                const existing_item = hasProduct[0]
                existing_item.quantity += item.quantity
                // console.log('existingitem =>', existing_item)
                // console.log('cart =>', cart)
                
                new_cart = [...cart.filter(a => a._id !== item._id), existing_item]
            }else{
                console.log(item)
                new_cart = [...cart, item]
            }
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
