import React, {type FC} from "react";
import {useForm} from "react-hook-form";
import AppFormProvider from "@/components/Form/hook-form/app-form-provider.tsx";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@UI/button.tsx";
import RHFTextInput from "@/components/Form/hook-form/rhf-text-input.tsx";
import {initIdsRequest} from "@/lib/request.ts";

const registerFormSchema = z.strictObject({
    username: z.string().trim().min(1, {message:"invalid"}),
    password: z.string().trim().min(1, {message:"invalid"}),
    passwordRepeat: z.string().trim().min(1, {message:"invalid"})
}).refine(({passwordRepeat , password})=> passwordRepeat === password , {message:"passwords do not match" , path:["passwordRepeat"]})
const RegisterPage: FC = () => {
    const form = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            username: "",
            password: "",
            passwordRepeat: ""
        },
        mode: "all"
    });
    const {handleSubmit} = form;
    const onSubmit = handleSubmit((data) => {
        initIdsRequest().post("/email/register" , {
            email:data.username,
            password:data.password
        }).then(r => {
            alert("Done!")
        }).catch(()=>alert("I Told you long ago.."))
    });
    return (<div className="items-center justify-center flex w-full h-[100vh]">
        <div className="rounded-2xl w-[300px] min-h-80 bg-background border-solid border-2 border-neutral-800">
            <AppFormProvider className={"p-4 gap-4 flex-col flex"} methods={form} onSubmit={onSubmit}>
                <RHFTextInput animatedInput animateError placeholder={"Username"} label={"Username"} name={"username"}/>
                <RHFTextInput animatedInput animateError placeholder={"Password"} label={"Password"} name={"password"} type={"password"}/>
                <RHFTextInput animatedInput animateError placeholder={"Password Repeat"} label={"Password Repeat"} name={"passwordRepeat"} type={"password"}/>

                <Button type={"submit"}>
                    submit
                </Button>
            </AppFormProvider>
        </div>
    </div>);
};

export default RegisterPage;
