import {useFormContext} from "react-hook-form";
import {Input, type InputProps} from "@UI/input";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/Form";
import {AnimatedInput} from "@UI/AnimatedInput.tsx";
import * as React from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@UI/tooltip.tsx";
import {CircleHelp} from "lucide-react";
import {cn} from "@/lib/shadcn-utils.ts";

type Props = InputProps & {
    helperText?: string;
    name: string;
    animateError?: boolean;
    animatedInput?: boolean;
    label?: string;
    description?: string;
    wrapperProps?: React.HTMLAttributes<HTMLDivElement>,
    hideFormMessages?: boolean
};

export default function RHFTextInput({
    name,
    helperText,
    type,
    animatedInput,
    description,
    animateError,
    wrapperProps,
    hideFormMessages,
    label,
    ...other
}: Props) {
    const {control} = useFormContext();
    const InputComponent = animatedInput ? AnimatedInput : Input;
    return (
        <FormField
            control={control}
            name={name}
            render={({field, fieldState}) => (
                <FormItem  {...wrapperProps}>
                    {label && <div className={"flex gap-2 flex-row items-center"}>
                        <FormLabel className={cn({"opacity-60": other.disabled})}>{label}</FormLabel>
                        {helperText && <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger><CircleHelp/></TooltipTrigger>
                                <TooltipContent className={"mb-3"}>
                                    <p className={"max-w-[280px] md:max-w-[300px]"}>{helperText}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        }
                    </div>
                    }
                    <FormControl>
                        <InputComponent
                            {...field}
                            type={type}
                            value={type === "number" && field.value === 0 ? "" : field.value}
                            onChange={event => {
                                if (type === "number") {
                                    field.onChange(Number(event.target.value));
                                } else {
                                    field.onChange(event.target.value);
                                }
                            }}
                            {...other}
                        />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    {!hideFormMessages && <FormMessage shouldAnimate={animateError}/>}
                </FormItem>
            )}
        />
    );
}
