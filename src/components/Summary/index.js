import React from 'react'
import { fetchFromStorage } from '../../utils/storage'

function Summary() {
    const cart = fetchFromStorage('cart')
    return (
        <div>
            <pre>{JSON.stringify(cart, null, 4)}</pre>
        </div>
    )
}

export default Summary
