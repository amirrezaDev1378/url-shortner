import React, {type FC, useEffect} from "react";
import {useForm} from "react-hook-form";
import AppFormProvider from "@/components/Form/hook-form/app-form-provider.tsx";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@UI/button.tsx";
import RHFTextInput from "@/components/Form/hook-form/rhf-text-input.tsx";
import OAuthUI from "@/components/Pages/Auth/OAuth";
import {initIdsRequest} from "@/lib/request.ts";

const loginFormSchema = z.strictObject({
    username: z.string().trim().min(1, {message:"invalid"}),
    password: z.string().trim().min(1, {message:"invalid"})
});
const LoginPage: FC = () => {
    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: "",
            password: ""
        },
        mode: "all"
    });
    const {handleSubmit} = form;
    const onSubmit = handleSubmit((data) => {
        initIdsRequest().post("/email/login" , {
            email:data.username,
            password:data.password
        } , {
            withCredentials:true
        }).then(r => {
            alert("Done!")
        }).catch(()=>alert("I Told you long ago.."))
    });

    useEffect(()=>{
       initIdsRequest().get("/user/user-info" , {
           withCredentials:true
       })
    },[])
    return (<div className="items-center justify-center flex w-full h-[100vh]">
        <div className="rounded-2xl w-[300px] min-h-80 bg-background border-solid border-2 border-neutral-800">
            <AppFormProvider className={"p-4 gap-4 flex-col flex"} methods={form} onSubmit={onSubmit}>
                <RHFTextInput animatedInput animateError placeholder={"Username"} label={"Username"} name={"username"}/>
                <RHFTextInput animatedInput animateError placeholder={"Password"} label={"Password"} name={"password"} type={"password"}/>

                <Button type={"submit"}>
                    submit
                </Button>
            </AppFormProvider>
        </div>
        <hr/>
        <p>
            Fix these styles
        </p>
        <button onClick={()=>{
            const cacelToken = new AbortController()

            initIdsRequest().post("https://127.0.0.1:3033/api/v1/urls/create" , {
                "slug":"s" + Math.round(Math.random() * 1000),
                "general_redirect_path":"https://deadsimplechat.com/blog/how-to-use-go-channels/",
                "ios_redirect_path" :"https://time.ir",
                "type":"static"
            } , {
                signal:cacelToken.signal
            })
            setTimeout(()=>{
                cacelToken.abort("fuck u")
            },100)
        }}>
            ass asdasd
        </button>
        <OAuthUI />
    </div>);
};

export default LoginPage;
