import React, {type FC, useState} from "react";
import {CardHoverEffect, type HoverCardItemType} from "@UI/HoverCard.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {CreateStandardUrl, CreateUrlWithPage, CreateUrlWithProxy} from "./components/CreateUrlComponents";
import {Undo2} from "lucide-react";
import {Button} from "@UI/button.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/UI/dialog";

const UrlTypes = [
    {
        id: "standard",
        title: "Standard Link",
        description: "will redirect uoy"
    },
    {
        id: "proxy",
        title: "Proxy Link",
        description: "Super fast one but require pro !!!",
        disabled: true
    },
    {
        id: "with-page",
        title: "With Page Link",
        description: "Add a page before redirecting",
        disabled: true

    }
];
type UrlComponentsType = { [key: string]: FC }
const UrlTypeComponents: UrlComponentsType = {
    "with-page": CreateUrlWithPage,
    "standard": CreateStandardUrl,
    "proxy": CreateUrlWithProxy,
};

const CreateUrlsPage: FC = () => {
    const [activeCardMode, setActiveCardMode] = useState<keyof UrlComponentsType>(null);
    const [showUnavailableModal, setShowUnavailableModal] = useState(false);
    const UrlComponent = UrlTypeComponents[activeCardMode];
    const onCardClick = (item: HoverCardItemType) => {
        if (item.disabled) return setShowUnavailableModal(true)
        if (activeCardMode !== item.id) setActiveCardMode(item.id);
    };
    const resetActiveCardMode = () => {
        if (activeCardMode !== null) setActiveCardMode(null);
    };
    return (<div className={"flex flex-col justify-center items-center  w-full p-6"}>
        <h3 className={"text-left text-3xl mt-5 w-full"}>
            Create A New Short Link.
        </h3>
        <hr className={"my-4 w-full"}/>

        <AnimatePresence mode={"popLayout"}>
            {!UrlComponent
                ? <motion.div
                    className={"w-full justify-center flex flex-col  items-center"}
                    key={"main-section"}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}

                >
                    <p className={"text-center text-xl mt-8"}>
                        Please choose the type of link you want to create.
                    </p>
                    <CardHoverEffect onCardClick={onCardClick} className={"max-w-[80%] cursor-pointer"} items={UrlTypes}/>
                </motion.div>
                : <motion.div
                    className={"w-full"}
                    key={"url-component"}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                >
                    <Button variant={"outline"} onClick={resetActiveCardMode}>
                        <Undo2/>
                    </Button>
                    <UrlComponent/>
                </motion.div>
            }
        </AnimatePresence>
        <Dialog open={showUnavailableModal} onOpenChange={setShowUnavailableModal}>
            {/*<DialogTrigger>Open</DialogTrigger>*/}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sorry but this mode is not available 🥺</DialogTitle>
                    <DialogDescription className={"pt-4"}>
                        This mode is still under development!
                        Our team is trying it's best to deliver this mode to you as fast as possible ☺️
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    </div>);
};

export default CreateUrlsPage;
