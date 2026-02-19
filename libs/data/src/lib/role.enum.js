"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleHierarchy = exports.Role = void 0;
var Role;
(function (Role) {
    Role["Owner"] = "owner";
    Role["Admin"] = "admin";
    Role["Viewer"] = "viewer";
})(Role || (exports.Role = Role = {}));
exports.RoleHierarchy = {
    [Role.Owner]: 3,
    [Role.Admin]: 2,
    [Role.Viewer]: 1,
};
