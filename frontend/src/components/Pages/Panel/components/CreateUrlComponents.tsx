import React, {type FC, useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import AppFormProvider from "@/components/Form/hook-form/app-form-provider.tsx";
import RHFTextInput from "@/components/Form/hook-form/rhf-text-input.tsx";
import {Button} from "@UI/button.tsx";
import {Label} from "@UI/label.tsx";
import {Checkbox} from "@UI/checkbox.tsx";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";


const CreateUrlWithPage: FC = () => {
    return (<div>

    </div>);
};
const CreateUrlWithProxy: FC = () => {

    return (<div>

    </div>);
};

const CreateStandardUrl: FC = () => {
    const standardUrlSchema = z.strictObject({
        name: z.string().trim().min(1),
        destination: z.string().trim().min(1).url(),
        slug: z.string().trim().min(1),
        "ios-destination": z.string().trim().min(1).url().optional().or(z.literal(""))
            .refine(r => customDevicesState.ios ? !!r : true, {message: "Provide ios link"}),
        "android-destination": z.string().trim().min(1).url().optional().or(z.literal(""))
            .refine(r => customDevicesState.android ? !!r : true, {message: "Provide android link"}),
    });
    const methods = useForm<z.infer<typeof standardUrlSchema>>({
        resolver: zodResolver(standardUrlSchema),
        mode: "all",
        defaultValues: {
            slug: "",
            name: "",
            destination: "",
            "android-destination": "",
            "ios-destination": ""
        }
    });
    const {handleSubmit, trigger, formState:{errors}} = methods;

    const [customDevicesState, setCustomDevicesState] = useState({
        ios: false,
        android: false
    });
    const toggleCustomDevice = (type: "ios" | "android") => () => setCustomDevicesState((p) => ({...p, [type]: !p[type]}));

    useEffect(()=>{
        trigger("ios-destination")
        trigger("android-destination")
    } , [customDevicesState])
    const onFormSubmit = handleSubmit((data) => {

    });

    return (<AppFormProvider onSubmit={onFormSubmit} className={"w-full flex flex-col items-center"} methods={methods}>
        <div className={"w-[50%] flex-wrap flex flex-col gap-6  border-neutral-700 border-2 border-solid rounded-xl p-6 "}>
            <h4 className={"text-center text-4xl mb-2"}>
                Standard URL
            </h4>

            <RHFTextInput
                helperText={"Enter a name for your link, this will not be shown to anyone, it's just for your self"} animatedInput animateError
                name={"name"} label={"name"}
            />
            <RHFTextInput animatedInput animateError name={"destination"} label={"Destination URL"}/>
            <div className={"flex flex-col items-start w-full"}>
                <Label className={"pb-1"}>
                    Slug
                </Label>
                <div className={"flex flex-row items-end gap-6 w-full"}>

                    <p className={"text-3xl pb-1"}>
                        {import.meta.env.PUBLIC_URLS_DOMAIN} /
                    </p>
                    <RHFTextInput hideFormMessages animatedInput animateError name={"slug"} placeholder={"slug"} wrapperProps={{className: "flex-1"}}/>
                    <Button className={"h-[40px] m-[2px]"}>
                        Generate Link
                    </Button>
                </div>

            </div>
            <div className={"flex flex-row gap-6 items-center w-full justify-between"}>
                <RHFTextInput
                    wrapperProps={{className: "flex-1"}} disabled={!customDevicesState.ios} animatedInput animateError
                    name={"ios-destination"} label={"IOS Destination"}
                    description={"If you like to redirect IOS users to another url, use this option."}
                />
                <Checkbox className={"mb-2"} checked={customDevicesState.ios} onClick={toggleCustomDevice("ios")}/>
            </div>
            <div className={"flex flex-row gap-6 items-center w-full justify-between"}>
                <RHFTextInput
                    wrapperProps={{className: "flex-1"}} disabled={!customDevicesState.android} animatedInput animateError
                    name={"android-destination"} label={"Android Destination"}
                    description={"If you like to redirect Android users to another url, use this option."}
                />
                <Checkbox className={"mb-2"} checked={customDevicesState.android} onClick={toggleCustomDevice("android")}/>
            </div>
            <Button type={"submit"}>
                create
            </Button>
        </div>
    </AppFormProvider>);
};

export {CreateUrlWithPage, CreateUrlWithProxy, CreateStandardUrl};
