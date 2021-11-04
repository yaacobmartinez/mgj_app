import React, { useState } from 'react'
import { Box } from '@mui/system'
import QrReader from "react-qr-reader";
import axiosInstance from '../../utils/axios';

function ScannerComponent() {
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

    return (
        <Box>
            {
                product ? (
                    <pre>{JSON.stringify(product, null, 4)}</pre>
                ): (

                    <QrReader
                        delay={300}
                        onError={(err) => console.log(err)}
                        onScan={handleScan}
                        style={{ width: "100%" }}
                    />
                    )
                }
        </Box>
    )
}

export default ScannerComponent
