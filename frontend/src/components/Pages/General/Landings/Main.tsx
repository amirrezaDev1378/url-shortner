import React, { type FC, useState } from "react";
import { Spotlight } from "@/components/AnimatedSections/SpotLight.tsx";
import { FlipWords } from "@/components/AnimatedSections/FlipWords.tsx";
import { AuroraBackground } from "@/components/AnimatedSections/AuroraBackground.tsx";
import { motion } from "framer-motion";
import { Button } from "@UI/button.tsx";
import { Dialog, DialogContent, DialogDescription } from "@UI/dialog.tsx";
import MainGeneralLayout from "@/components/Pages/General/Layouts/Main";

const MainLanding: FC = () => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const openModal = () => setIsModalOpen(true);

	return (
		<MainGeneralLayout>
			<div className={"h-[100svh] w-full snap-y snap-mandatory overflow-auto"}>
				<div className="relative flex h-[100svh] w-full snap-center overflow-hidden rounded-md bg-black/[0.96] antialiased bg-grid-white/[0.02] md:items-center md:justify-center">
					<Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
					<div className="flex h-[40rem] items-center justify-center px-4">
						<div className="mx-auto text-4xl font-normal text-neutral-600 dark:text-neutral-400">
							Build
							<FlipWords duration={2000} words={["shorter", "faster", "better"]} /> <br />
							URLs with ease.
						</div>
					</div>
				</div>
				<AuroraBackground
					containerProps={{
						className: "snap-center h-[100svh]",
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
						className="relative flex flex-col items-center justify-center gap-4 px-4"
					>
						<div className="text-center text-3xl font-bold dark:text-white md:text-7xl">Start shortening your URLs today.</div>
						<div className="py-4 text-base font-extralight dark:text-neutral-200 md:text-4xl">
							It's free, easy and secure. Also, no ads.
						</div>
						<Button
							onClick={openModal}
							variant={"default"}
							className="w-fit rounded-full bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
						>
							Start Now
						</Button>
					</motion.div>
				</AuroraBackground>

				{/* Dialogs */}
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent>
						<DialogDescription asChild>
							<motion.p
								className={"text-white"}
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								transition={{ delay: 0.1, duration: 0.3 }}
							>
								You can use our service without any registration, but if you want to manage your links and use all the features you
								will need to create an account.
								<br />
								What do you prefer to do?
							</motion.p>
						</DialogDescription>
						<DialogDescription asChild className={"flex flex-row items-center gap-4"}>
							<motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }}>
								<Button asChild variant={"default"}>
									<a href="/auth/register">Create an account.</a>
								</Button>
								<Button asChild className={"text-white"} variant={"outline"}>
									<a href="/temp-urls/create">Start Now!</a>
								</Button>
							</motion.div>
						</DialogDescription>
					</DialogContent>
				</Dialog>
			</div>
		</MainGeneralLayout>
	);
};

export default MainLanding;
