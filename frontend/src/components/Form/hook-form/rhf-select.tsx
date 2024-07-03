import { useFormContext, Controller } from "react-hook-form";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@UI/select";
import React from "react";

// ----------------------------------------------------------------------

type RHFSelectProps = {
   label: string;
   name: string;
   defaultValue?: any;
   native?: boolean;
   maxHeight?: boolean | number;
   children: React.ReactNode[];
};

export function RHFSelect({ name, label, children, defaultValue }: RHFSelectProps) {
   const { control } = useFormContext();

   return (
      <Controller
         name={name}
         control={control}
         render={({ field, fieldState: { error } }) => (
            <Select defaultValue={defaultValue} {...field}>
               <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={label} />
               </SelectTrigger>
               <SelectContent>{children}</SelectContent>
            </Select>
         )}
      />
   );
}
