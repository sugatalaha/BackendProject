class ApiResponse
{
    constructor(status,data,message)
    {
        this.data=data;
        this.status=status
        this.message=message
        this.success=status<400
    }
}

export default ApiResponse