class ApiError extends Error
{
    constructor(
        code,
        message="Something went wrong",
        errors=[]
    ){
        super(message)
        this.data=null
        this.statusCode=code
        this.success=false
        this.errors=errors       
    }
}

export default ApiError;