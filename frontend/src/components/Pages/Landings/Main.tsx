import React, { type FC } from "react";
import { Spotlight } from "@/components/AnimatedSections/SpotLight.tsx";
import { FlipWords } from "@/components/AnimatedSections/FlipWords.tsx";
import { AuroraBackground } from "@/components/AnimatedSections/AuroraBackground.tsx";
import { motion } from "framer-motion";
import { Button } from "@UI/button.tsx";

const MainLanding: FC = () => {
	return (
		<div className={"snap-y snap-mandatory"}>
			<div className="snap-center h-[100svh] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
				<Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
				<div className="h-[40rem] flex justify-center items-center px-4">
					<div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
						Build
						<FlipWords duration={2000} words={["shorter", "faster", "better"]} /> <br />
						URLs with ease.
					</div>
				</div>
			</div>
			<AuroraBackground
				containerProps={{
					className: "snap-center",
				}}
			>
				<motion.div
					initial={{ opacity: 0.0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.3,
						duration: 0.8,
						ease: "easeInOut",
					}}
					className="relative flex flex-col gap-4 items-center justify-center px-4"
				>
					<div className="text-3xl md:text-7xl font-bold dark:text-white text-center">Start shortening your URLs today.</div>
					<div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
						It's free, easy and secure. Also, no ads.
					</div>
					<Button variant={"default"} className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2">
						Start Now
					</Button>
				</motion.div>
			</AuroraBackground>
		</div>
	);
};

export default MainLanding;
