export class ApiError extends Error {
    status: number;
    errors: any[];

    constructor(status: number, message: string, errors: any[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static UnauthorizedError() {
        return new ApiError(401, 'User is not authorized');
    }

    static AccessRightsError() {
        console.log('Access error')
        return new ApiError(403, 'User does not have access rights');
    }

    static UserIsBlocked() {
        return new ApiError(403, 'User has been blocked');
    }

    static BadRequest(message: string, errors: any[] = []) {
        console.log(message)
        return new ApiError(400, message, errors);
    }
};