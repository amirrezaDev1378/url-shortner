"use client";

import React, {type FC, type ReactNode, useState} from "react";
import {HamburgerMenuIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/shadcn-utils.ts";

interface Props {
    children: ReactNode | ReactNode[];
    currentRoute: string;
}

const LinkItem = ({href, title, currentRoute}) => {
    const isActive = currentRoute === href;
    // TODO: - I think prefetch is not working correctly, should be investigated
    return <a data-astro-prefetch="hover" className={cn({"bg-blue-300": isActive})} href={href}>{title}</a>;
};
const PanelLayout: FC<Props> = ({children, currentRoute}) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const toggleMenu = () => setMenuVisible(!menuVisible);

    return (<div className="flex w-full h-full flex-col md:flex-row">
        <div id="mobile-header" className="w-full h-[50px] justify-between md:hidden">
            <HamburgerMenuIcon onClick={toggleMenu} id="hamburger-menu" className="cursor-pointer"/>
        </div>

        <div onClick={toggleMenu} className={cn({"lightbox": menuVisible}, "md:hidden")}/>
        <div id="menu" className={"relative md:w-44 md:mt-6 md:ml-4 md:mr-4"}>
            <div className={
                cn(`transition-all md:transition-none absolute top-0 md:left-0 
                  h-full flex flex-col items-start gap-2 md:w-44  md:pt-6 md:pl-4
                  md:border-r md:border-solid md:border-neutral-700 md:fixed
                  `, {
                    "left-0": menuVisible,
                    "left-[-100%]": !menuVisible
                })}>

                <LinkItem currentRoute={currentRoute} href={"/panel/manage"} title={"manage"}/>
                <LinkItem currentRoute={currentRoute} href={"/panel/create"} title={"create"}/>
                <LinkItem currentRoute={currentRoute} href={"/panel/analytics"} title={"analytics"}/>
            </div>
        </div>

        {children}
    </div>);
};

export default PanelLayout;
