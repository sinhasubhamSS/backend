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
//     }.catch((err)=>next(err))

// }You’ve used asyncHandler in your code to simplify error handling across your route handlers. Here’s why it’s useful in your setup:

// Centralized Error Handling: By wrapping your asynchronous route handlers with asyncHandler, you ensure that any errors thrown during the execution of these handlers are automatically caught and passed to Express's error-handling middleware.

// Cleaner Code: It helps keep your route handlers clean and focused on their core logic without having to explicitly handle promise rejections or errors. Instead of wrapping every async function with a try-catch block, you can use asyncHandler to do this for you.

// Consistency: It provides a consistent way to handle asynchronous errors across different route handlers and controllers. This makes your codebase easier to maintain and less prone to bugs related to error handling.

// Separation of Concerns: By using asyncHandler, you separate the error-handling logic from your business logic. Your route handlers can focus on processing requests and responses, while asyncHandler manages error propagation.