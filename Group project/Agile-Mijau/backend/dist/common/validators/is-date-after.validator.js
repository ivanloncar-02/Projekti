"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDateAfter = IsDateAfter;
const class_validator_1 = require("class-validator");
function IsDateAfter(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isDateAfter',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = args.object[relatedPropertyName];
                    if (!value || !relatedValue) {
                        return true;
                    }
                    const date1 = new Date(relatedValue);
                    const date2 = new Date(value);
                    return date2 > date1;
                },
                defaultMessage(args) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must be after ${relatedPropertyName}`;
                },
            },
        });
    };
}
//# sourceMappingURL=is-date-after.validator.js.map