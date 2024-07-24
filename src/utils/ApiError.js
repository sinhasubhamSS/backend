class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""

    )
    {
        super(message)
        this.statusCode=statusCode
        this.data=null //read about it
        this.message=message //super already did this you can remove and check
        this.success=false
        this.errors=errors

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}
export {ApiError}