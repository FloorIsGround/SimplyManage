import { useState, useEffect } from "react";
import { Role, UserStatus } from "../../Models/User/User";
import type { User } from "../../Models/User/User";
import axios from "../../utils/axios-api";
import { validateFields, signUpValidationRules } from "../../utils/validation";

const initialForm: User = {
  id: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  role: Role.patron,
  status: UserStatus.active,
  createdAt: new Date(),
  borrowedBooks: [],
};

function useSignUpForm() {
  const [form, setForm] = useState<User>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const dateValue = form.dateOfBirth ? new Date(form.dateOfBirth) : null;

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    dateOfBirth: false,
  });

  const handleTouch = (field: keyof typeof touched, value: boolean) =>
    setTouched(t => ({ ...t, [field]: value }));

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setForm(f => ({ ...f, dateOfBirth: "" }));
      return;
    }
    setForm(f => ({ ...f, dateOfBirth: date.toISOString().split("T")[0] }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setTouched({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      dateOfBirth: false,
    });
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  const handleSubmit = async () => {
    const validationError = validateFields(form, signUpValidationRules);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    setSuccess(false);
    try {
      await axios.post("/signup", form);
      setSuccess(true);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };
  
  return {
    form,
    setForm,
    touched,
    handleTouch,
    dateValue,
    handleDateChange,
    error,
    loading,
    success,
    handleSubmit,
  };
}

export { initialForm, useSignUpForm };
