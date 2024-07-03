import { Controller, useFormContext } from "react-hook-form";
import React from "react";

// ----------------------------------------------------------------------

type Props = React.HTMLProps<HTMLInputElement> & {
   name: string;
   hidden: boolean;
};

const RHFFileUpload = React.forwardRef<HTMLInputElement, Props>(({ name, hidden, ...other }, ref) => {
   const { control } = useFormContext();

   return (
      <Controller
         name={name}
         control={control}
         render={({ field, fieldState: { error } }) => {
            return (
               <>
                  <input
                     {...other}
                     {...field}
                     name={name}
                     type={"file"}
                     hidden={hidden}
                     onChange={e => field.onChange((e?.target?.files || [])[0])}
                     value={""}
                     ref={e => {
                        field.ref(e);
                        if (ref) {
                           (ref as any).current = e;
                        }
                     }}
                  />
                  {!!error?.message && <p className={"text-secondary"}>{error?.message}</p>}
               </>
            );
         }}
      />
   );
});
export default RHFFileUpload;
