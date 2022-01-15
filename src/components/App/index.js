import { Add, AddCircle, AddShoppingCart, ArrowBackIosNewOutlined, ArrowBackOutlined, Backspace, Cameraswitch, ChevronLeft, Close, CloudDownload, CountertopsOutlined, CropFreeOutlined, Delete, DeleteSweep, Download, HomeOutlined, Menu, Receipt, Refresh, RefreshOutlined, Remove, RemoveCircle, ShareOutlined, ShoppingCartOutlined,} from '@mui/icons-material'
import {  AppBar, Avatar, Button, ButtonGroup, Dialog, Divider, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, SwipeableDrawer, Toolbar, Typography } from '@mui/material'
import React, { createRef, useCallback, useEffect, useState } from 'react'
import {AccountBalanceWallet} from '@mui/icons-material'
import { fetchFromStorage, saveToStorage, clearStorage } from '../../utils/storage'
import QrReader from 'react-qr-reader'
// import QrReader from 'react-qr-scanner'
import axiosInstance from '../../utils/axios'
import { totalReducer } from '../../utils'
import QRCode from 'qrcode.react'
import { useScreenshot } from 'use-react-screenshot'

import {
    LeadingActions,
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
    Type as ListType,
  } from 'react-swipeable-list';
  import 'react-swipeable-list/dist/styles.css';
import { useHistory } from 'react-router-dom'

function ScannerApp() {
    const history = useHistory()
    const cart = fetchFromStorage('cart')
    const [items, setItems] = useState( cart || [])
    const [openScan, setOpenScan] = useState(false)
    const [openPayment, setOpenPayment] = useState(false)
    const [openCart, setOpenCart] = useState(false)
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
        <div style={{minHeight: '100vh', backgroundColor: '#E2FDFF', paddingBottom: 100}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10}}>
                <Avatar onClick={() => window.location.reload()} sx={{ bgcolor: "#fff", border: 'solid 1px #E6E6E9', color: '#6C6F7D' }} variant="rounded" style={{borderRadius: '16px'}}>
                    <RefreshOutlined />
                </Avatar>
                {/* <Avatar sx={{ bgcolor: "#fff", border: 'solid 1px #E6E6E9', color: '#6C6F7D', }} variant="rounded" style={{borderRadius: '16px'}}>
                    <ShareOutlined />
                </Avatar> */}
            </div>
            <div style={{
                padding: 10, borderRadius: 20, height: 200, textAlign: 'center',
                margin: 20,
                background: "linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)", 
                boxShadow: '0px 39px 66px 0px rgba(0,0,0,0.42)',
            }}>
                <Typography variant="h6" style={{color: '#fff'}}>Balance</Typography>
                <Typography variant="caption" style={{color: '#fff', fontSize: '1.5rem'}}>₱{" "}</Typography>
                <Typography variant="caption" style={{color: '#fff', fontSize: '4rem', fontWeight: 'bolder'}}> {cart ? parseFloat(cart?.reduce(totalReducer, 0)).toFixed(2) : `0.00`}</Typography>
                <br/>
                <Button 
                    disabled={items?.length < 1}
                    onClick={() => setOpenPayment(true)}
                    variant="contained" sx={{backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius:20, paddingX: 10, paddingY: 2}} size="large"> 
                    <Typography sx={{color: "#fff"}}>Pay Now</Typography>
                </Button>
            </div>
            <div style={{padding: 20, marginTop: 40}}>
                <Typography sx={{fontSize: 20, fontWeight: 'bold', color: '#6C6F7D'}}>Recent Products</Typography>
                <Grid container spacing={2}>
                    {cart?.map((item) => (
                        <Grid item xs={4} sx={{textAlign: 'center', padding:2}} key={item}>
                            <Avatar alt="test" src={item?.media[0]}
                                sx={{height: 85, width: '100%', marginY: 1, }}
                                variant="rounded"
                                style={{borderRadius: '16px'}}
                            />
                            <Typography variant="caption" style={{fontWeight: 'bold'}}>{item?.name}</Typography>
                        </Grid>
                    ))}
                    
                </Grid>
            </div>
            <ScanDrawer open={openScan} onClose={() => setOpenScan(!openScan)} onOpen={() => setOpenScan(!openScan)} onChange={handleCartChange} />
            <CartDrawer handlePay={() => setOpenPayment(true)} handleRemove={handleRemove} open={openCart} onClose={() => setOpenCart(!openCart)} onOpen={() => setOpenCart(!openCart)} onChange={handleCartChange} />
            {openPayment && (
                <PaymentDialog open={openPayment} onClose={() => setOpenPayment(false)} />
            )}
            
            <div style={{position: 'fixed', paddingBottom: 30, paddingTop: 10, bottom: 0, width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                <Avatar 
                    onClick={() => history.push(`/`)}
                    sx={{ bgcolor: "#fff", border: 'solid 1px #E6E6E9', color: '#6C6F7D' }} variant="rounded" style={{borderRadius: '16px'}}>
                    <HomeOutlined />
                </Avatar>
                <Avatar  
                    onClick={() => setOpenScan(!openScan)}
                    alt="Scan Product"
                    sx={{ width: 60, height: 60, 
                        background: "linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)"
                    }}
                    variant="rounded" style={{borderRadius: '16px', boxShadow: '0px 22px 42px -14px rgba(0,0,0,0.42)'}}
                >
                    <CropFreeOutlined />
                </Avatar>
                <Avatar
                    onClick={() => setOpenCart(!openCart)}
                    sx={{ bgcolor: "#fff", border: 'solid 1px #E6E6E9', color: '#6C6F7D' }} variant="rounded" style={{borderRadius: '16px'}}>
                    <ShoppingCartOutlined />
                </Avatar>
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

    const ref = createRef()
    const [image, takeScreenshot] = useScreenshot()
    const getImage = () =>{ 
        takeScreenshot(ref.current)
        var a = document.createElement("a"); //Create <a>
        a.href = image; //Image Base64 Goes here
        a.download = "transaction.png"; //File name Here
        a.click()
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
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 10, 
                border: 'solid 1px #e1e1e1', borderRadius: 10
            }}>
                    <div style={{position: 'absolute', top: 70, right: 15}}>
                        <IconButton size="small" onClick={getImage}>
                            <Download />
                        </IconButton>
                    </div>
                    <div ref={ref} style={{margin: 10}}>
                    <Typography variant="body2" component="h6" gutterBottom style={{textAlign: 'center'}}>
                        MGJ FOOD Product Trading
                    </Typography>
                    <Typography variant="body2" component="h6" gutterBottom style={{textAlign: 'center'}}>
                        880 Cabiawan, Banga 1st 3004 Plaridel, Philippines
                    </Typography>
                    <Divider />
                    <Typography variant="body2" component="h6" gutterBottom style={{textAlign: 'center', marginTop: 10}}>
                        **SALES INVOICE**
                    </Typography>
                    {/* <QRCode value={paymentDetails?._id} size={128}/> */}
                    <Typography variant="caption" component="h6" gutterBottom style={{textAlign: 'center', marginTop: 10}} >
                        INVOICE ID: {paymentDetails?._id}
                    </Typography>
                    <Divider />
                    {paymentDetails?.cart.map((item, index) => (
                        <CartItem item={item} removeItem={() => console.log(1)} hasRemove={false} key={index}/>
                    ))}
                    <div style={{display: 'flex', justifyContent: 'space-between' , alignItems: "center", width: '100%', paddingBottom:10}} >
                        <Typography variant="caption">Item(s) : {paymentDetails?.cart?.length}</Typography>
                        <Typography variant="caption" style={{textAlign: 'right'}}>Qty(s) : {paymentDetails?.cart?.reduce((prev, current) =>  parseFloat(prev) + parseFloat(current.quantity),0)}</Typography>
                    </div>
                    <Divider />
                    <div style={{display: 'flex', justifyContent: 'space-between' , alignItems: "center", width: '100%', paddingBottom:20, marginTop: 10,}}>
                        <Typography variant="caption">SUBTOTAL</Typography>
                        <Typography variant="caption" style={{textAlign: 'right'}}>{paymentDetails?.total?.toFixed(2)}</Typography>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between' , alignItems: "center", width: '100%'}}>
                        <Typography variant="caption">Vatable Sales</Typography>
                        <Typography variant="caption" style={{textAlign: 'right'}}>{parseFloat(parseFloat(paymentDetails?.total) / parseFloat(1.12)).toFixed(2)}</Typography>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between' , alignItems: "center", width: '100%', paddingBottom: 20}}>
                        <Typography variant="caption">Vat Amount</Typography>
                        <Typography variant="caption" style={{textAlign: 'right'}}>{(parseFloat(paymentDetails?.total) - (parseFloat(parseFloat(paymentDetails?.total) / parseFloat(1.12)))).toFixed(2)}</Typography>
                    </div>
                    <Divider />

                    <div style={{display: 'flex', alignItems: 'center', justifyContent:'space-between', width: '100%', marginBottom: 20, marginTop: 20}}>
                        <Typography variant="caption" component="h6" style={{fontWeight: 'bold', fontSize: 20}}>
                            Total
                        </Typography>
                        <Typography variant="caption" component="h6" style={{fontWeight: 'bold', fontSize: 20, textAlign: 'right'}}>
                            ₱ {(paymentDetails?.total)?.toFixed(2)}
                        </Typography>
                    </div>
                    <Divider />
                    <Typography variant="caption" component="h6" gutterBottom style={{textAlign: 'center', marginTop: 10}} color="GrayText">
                        **STRICTLY NO CASH REFUND.**
                    </Typography>
                    <Divider />
                    <Typography variant="caption" component="h6" gutterBottom style={{textAlign: 'center', marginTop: 10}} color="GrayText">
                        THIS SERVES AS YOUR SALES INVOICE
                    </Typography>
                    <Typography variant="caption" component="h6" gutterBottom style={{textAlign: 'center', marginTop: 10}} color="GrayText">
                        THANK YOU FOR SHOPPING WITH US
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


const CartDrawer = ({open, onClose, onOpen, onChange, handleRemove, handlePay}) => {
    const cart = fetchFromStorage('cart')
    const handleAddQuantity = (item) => {
        item.quantity += 1
        const newCart = [...cart.filter(a => a._id !== item._id), item]
        saveToStorage('cart', newCart)
        onChange(newCart)
    }
    const handleRemoveQuantity = (item) => {
        if (item.quantity > 1){
            item.quantity -= 1
            const newCart = [...cart.filter(a => a._id !== item._id), item]
            saveToStorage('cart', newCart)
            onChange(newCart)
        }else{
            const newCart = cart.filter(a => a._id !== item._id)
            saveToStorage('cart', newCart)
            onChange(newCart)
        }
    }
    const leadingActions = (item) => (
        <LeadingActions>
          <SwipeAction onClick={() =>handleAddQuantity(item)}>
            <div>
                <IconButton sx={{color: '#317B22',  height: "100%"}}>
                    <AddCircle />
                </IconButton>
            </div>
          </SwipeAction>
          <SwipeAction onClick={() => handleRemoveQuantity(item)}>
            <div>
                <IconButton sx={{color: '#FD151B', height: "100%"}}>
                    <RemoveCircle />
                </IconButton>
            </div>
          </SwipeAction>
        </LeadingActions>
      );
      
      const trailingActions = (data) => (
        <TrailingActions>
          <SwipeAction
            destructive={true}
            onClick={() => handleRemove(data._id)}
          >
              <div>
                <IconButton sx={{color: '#317B22',  height: "100%"}}>
                    <DeleteSweep />
                </IconButton>
                <Typography variant="caption" sx={{color: '#317B22'}}>Remove</Typography> 
              </div>
          </SwipeAction>
        </TrailingActions>
      );
    return (
        <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={onOpen}
        PaperProps={{
            style: {
                borderRadius: 20,
            }
        }}
    >
        <div style={{height: '90vh'}}>
            <div style={{padding: 10, position: 'absolute', top: 0, left: 0}}>
                <Avatar onClick={onClose} sx={{ bgcolor: "#fff", border: 'solid 1px #E6E6E9', color: '#6C6F7D', zIndex: 10000 }} variant="rounded" style={{borderRadius: '16px'}}>
                    <ArrowBackOutlined />
                </Avatar>
            </div>
            <div style={{width: '100%', marginTop: 20}}>
                <Typography variant="body2" sx={{color: '#000', fontSize: 18, fontWeight: 'bold', textAlign: 'center'}}>Your Cart Items</Typography>
            </div>
            <SwipeableList style={{marginTop: 20}} fullSwipe={false} type={ListType.IOS}>
                {cart?.sort((a, b) => a.stocks - b.stocks).map((item, index) => (
                    <SwipeableListItem
                        key={index}
                        leadingActions={leadingActions(item)}
                        trailingActions={trailingActions(item)}
                    >
                        <ListItem alignItems="center" sx={{padding: 2}}>
                            <ListItemAvatar>
                                <img alt={item.name} src={item.media[0]} style={{marginRight: 20, borderRadius: 50, boxShadow: '3px 15px 24px -13px rgba(0,0,0,0.9)', height: 50, width: 50}} />
                                {/* <Avatar alt={item.name} src={item.media[0]} sx={{boxShadow: '0px 22px 42px -14px rgba(0,0,0,0.42)'}}/> */}
                            </ListItemAvatar>
                            <ListItemText primary={
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div>
                                        <Typography variant="caption" sx={{fontWeight: 'bold', color: '#5941A9'}}>{item.quantity}</Typography>
                                        <Typography variant="caption" sx={{marginX: 1, color: 'GrayText'}}>x</Typography>
                                        <Typography variant="caption" sx={{fontSize: 16, fontWeight: 'bold', color: '#5941A9'}}>{item.name}</Typography>
                                    </div>
                                    <Typography variant="body2" sx={{fontSize: 16, color: 'GrayText'}}>
                                        ₱ {((parseFloat(item.initialPrice) + parseFloat(item.markupPrice)) * parseFloat(item.quantity)).toFixed(2)}
                                    </Typography>
                                </div>
                            } />
                        </ListItem>
                    </SwipeableListItem>
                ))}
                
            </SwipeableList>

            <div style={{position: 'fixed', paddingBottom: 30, paddingTop: 10, bottom: 0, width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                <Button  
                    onClick={handlePay}
                    alt="Scan Product"
                    sx={{
                        width: '70%',
                        paddingY: 1, 
                        fontWeight: 'bold',
                        background: "linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)"
                    }}
                    variant="rounded" style={{borderRadius: '16px', boxShadow: '0px 22px 42px -14px rgba(0,0,0,0.42)', color: '#fff',}}
                >
                    Pay Now
                </Button>
            </div>
        </div>
    </SwipeableDrawer>
    )
}

const ScanDrawer = ({open, onClose, onOpen, onChange}) => {
    const [product, setProduct] = useState(null)
    const [facingMode, setFacingMode] = useState("environment")
    const handleFacingMode = () => {
        if (facingMode === "environment") {
            return setFacingMode('user')
        }
        return setFacingMode('environment')
    }
    const handleClose = () => {
        setProduct(null)
        onClose()
    }
    const getProduct = React.useCallback(async(id) =>{
        if(id) {
            const {data} = await axiosInstance.get(`/products/${id}`)
            console.log(data)
            if (data.product.status !== 'Active') return
            setProduct(data.product)
        }
    },[])

    const handleScan = (data) => {
        // console.log(data)
        if (data) {
            getProduct(data)
        }
        
    }
    useEffect(() => {
        var isMounted = true
        if(isMounted) {
            setProduct(null)
        }
        return () => isMounted = false
    }, [])
    return (
        <SwipeableDrawer
            anchor="bottom"
            open={open}
            onClose={handleClose}
            onOpen={onOpen}
            PaperProps={{
                style: {
                    borderRadius: 20,
                }
            }}
        >
            <div style={{height: '100vh', backgroundColor: '#E2FDFF'}}>
                {!product ? (
                    <React.Fragment>
                        <div style={{padding: 10, position: 'absolute', top: 0, left: 0}}>
                            <Avatar onClick={handleClose} sx={{ bgcolor: "#fff", border: 'solid 1px #E6E6E9', color: '#6C6F7D', zIndex: 10000 }} variant="rounded" style={{borderRadius: '16px'}}>
                                <ArrowBackOutlined />
                            </Avatar>
                        </div>
                        <div style={{padding: 10, width: '95%', borderRadius: 10, position: 'absolute', bottom: 50,  textAlign: 'center'}}>
                            <Typography variant="body2" sx={{color: '#000', fontSize: 18, fontWeight: 'bold'}}>Point camera at a QRCode</Typography>
                        </div>
                        <div>
                            <QrReader
                                onError={(err) => console.log(err)}
                                onScan={handleScan}
                                style={{ 
                                    height: '100vh',
                                    width: '100%', 
                                    objectFit: 'cover', 
                                    borderRadius: 20 
                                }}
                                facingMode={facingMode}
                            />
                        </div>
                        <div style={{padding: 10, width: '95%', borderRadius: 10, position: 'absolute', bottom: 100,  textAlign: 'center'}}>
                            <IconButton onClick={handleFacingMode}>
                                <Cameraswitch sx={{color: '#000'}} fontSize='large'/>
                            </IconButton>
                        </div>
                    </React.Fragment>
                ): (
                    <React.Fragment>
                        <div style={{padding: 10, position: 'absolute', top: 0, left: 0}}>
                            <Avatar onClick={handleClose} sx={{ bgcolor: "#fff", border: 'solid 1px #E6E6E9', color: '#6C6F7D', zIndex: 10000 }} variant="rounded" style={{borderRadius: '16px'}}>
                                <ArrowBackOutlined />
                            </Avatar>
                        </div>
                        <ProductDetails item={product} onClose={handleClose} onChange={onChange}/>
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
        <div style={{padding: 15, marginTop: 50}}>
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
                    disabled={item.stocks < 1}
                >{item?.stocks < 1 ? `Out of Stock` : `Add To Cart`}</Button>
            </div>
        </div>
    )
}


export default ScannerApp
