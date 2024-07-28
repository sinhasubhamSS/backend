 const asyncHandler =(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
 }

export{asyncHandler}
// //higher order function -> the function which can accept parameter as a function and return function
// // const asyncHandler=()=>{}
// // const asyncHandler=(fn)=>()=>{}
// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//         await fn(res,req,next)        
//     } catch (error) {
//         res.status(err.code || 500 ).json({
//             success:false,
//             message:err.message
//         })
//     }

// }