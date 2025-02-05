export  class UserDto {
    _id;
    username;
    email;
    collections;
    roles;
    isActivated;

    constructor(model) {
        (this._id = model._id),
            (this.username = model.username),
            (this.email = model.email),
            (this.collections = model.collections),
            (this.roles = model.roles),
            (this.isActivated = model.isActivated);
    }
};