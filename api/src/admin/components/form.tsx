import { clx, Hint, Label } from "@medusajs/ui";
import { Slot } from "radix-ui";
import { createContext, forwardRef, useContext, useId } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

type FormFieldContextValue = { name: string };

type FormItemContextValue = { id: string };

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function Field<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formLabelId: `${id}-form-item-label`,
    formDescriptionId: `${id}-form-item-description`,
    formErrorMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

const Item = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div
          ref={ref}
          className={clx("flex flex-col space-y-2", className)}
          {...props}
        />
      </FormItemContext.Provider>
    );
  },
);

Item.displayName = "Form.Item";

const FormLabel = forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { formLabelId, formItemId } = useFormField();

  return (
    <Label
      id={formLabelId}
      ref={ref}
      className={clx(className)}
      htmlFor={formItemId}
      size="small"
      weight="plus"
      {...props}
    />
  );
});

FormLabel.displayName = "Form.Label";

const Control = forwardRef<
  React.ElementRef<typeof Slot.Root>,
  React.ComponentPropsWithoutRef<typeof Slot.Root>
>((props, ref) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formErrorMessageId,
    formLabelId,
  } = useFormField();

  return (
    <Slot.Root
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formErrorMessageId}`
      }
      aria-invalid={!!error}
      aria-labelledby={formLabelId}
      {...props}
    />
  );
});

Control.displayName = "Form.Control";

const ErrorMessage = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof Hint>
>(({ className, children, ...props }, ref) => {
  const { error, formErrorMessageId } = useFormField();
  const message = error ? String(error.message) : children;

  if (!message || message === "undefined") return null;

  return (
    <Hint
      ref={ref}
      id={formErrorMessageId}
      className={className}
      variant={error ? "error" : "info"}
      {...props}
    >
      {message}
    </Hint>
  );
});

ErrorMessage.displayName = "Form.ErrorMessage";

export const Form = Object.assign(FormProvider, {
  Item,
  Label: FormLabel,
  Control,
  ErrorMessage,
  Field,
});
