import { FormProvider as Form, type UseFormReturn } from "react-hook-form";
import React from "react";

// ----------------------------------------------------------------------

type Props = {
   children: React.ReactNode;
   methods: UseFormReturn<any>;
   onSubmit: VoidFunction;
} & React.HTMLAttributes<HTMLFormElement>;

export default function AppFormProvider({ children, onSubmit, methods, ...formProps }: Props) {
   return (
      <Form {...methods}>
         <form onSubmit={onSubmit} {...formProps}>
            {children}
         </form>
      </Form>
   );
}
