"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatusChangedEvent = exports.ApplicationCreatedEvent = void 0;
class ApplicationCreatedEvent {
    applicationId;
    studentId;
    internshipId;
    companyId;
    constructor(applicationId, studentId, internshipId, companyId) {
        this.applicationId = applicationId;
        this.studentId = studentId;
        this.internshipId = internshipId;
        this.companyId = companyId;
    }
}
exports.ApplicationCreatedEvent = ApplicationCreatedEvent;
class ApplicationStatusChangedEvent {
    applicationId;
    oldStatus;
    newStatus;
    studentId;
    constructor(applicationId, oldStatus, newStatus, studentId) {
        this.applicationId = applicationId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.studentId = studentId;
    }
}
exports.ApplicationStatusChangedEvent = ApplicationStatusChangedEvent;
//# sourceMappingURL=application.events.js.map