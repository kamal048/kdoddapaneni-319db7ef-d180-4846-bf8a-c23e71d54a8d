"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCategory = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Todo"] = "todo";
    TaskStatus["InProgress"] = "in_progress";
    TaskStatus["Done"] = "done";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskCategory;
(function (TaskCategory) {
    TaskCategory["Work"] = "work";
    TaskCategory["Personal"] = "personal";
    TaskCategory["Other"] = "other";
})(TaskCategory || (exports.TaskCategory = TaskCategory = {}));
