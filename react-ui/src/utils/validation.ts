export interface ValidationRule {
  field: string;
  validate: (value: any, allValues?: Record<string, any>) => string | null;
}

export function validateFields(
  values: Record<string, any>,
  rules: ValidationRule[]
): string | null {
  for (const rule of rules) {
    const error = rule.validate(values[rule.field], values);
    if (error) return error;
  }
  return null;
}

export const signUpValidationRules: ValidationRule[] = [
  {
    field: "email",
    validate: value =>
      !value ? "Email is required." :
      !/^\S+@\S+\.\S+$/.test(value) ? "Please enter a valid email address." : null,
  },
  {
    field: "password",
    validate: value =>
      !value ? "Password is required." :
      value.length < 7 ? "Password must be at least 7 characters." : null,
  },
  {
    field: "firstName",
    validate: value => (!value ? "First name is required." : null),
  },
  {
    field: "lastName",
    validate: value => (!value ? "Last name is required." : null),
  },
  {
    field: "dateOfBirth",
    validate: value => (!value ? "Date of birth is required." : null),
  },
];
