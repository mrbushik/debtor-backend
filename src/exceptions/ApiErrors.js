"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    static UnauthorizedError() {
        return new ApiError(401, 'User is not authorized');
    }
    static AccessRightsError() {
        console.log('Access error');
        return new ApiError(403, 'User does not have access rights');
    }
    static UserIsBlocked() {
        return new ApiError(403, 'User has been blocked');
    }
    static BadRequest(message, errors = []) {
        console.log(message);
        return new ApiError(400, message, errors);
    }
}
exports.ApiError = ApiError;
;
