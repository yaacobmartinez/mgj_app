export const totalReducer = (a, b) =>{
    const nextTotal = parseFloat((parseFloat(b.markupPrice) + parseFloat(b.initialPrice)) * b.quantity)  
    return parseFloat(a + nextTotal)
}