import { type Config } from "tailwindcss";

const tailwindAnimations: Pick<Config["theme"], "animation" | "keyframes"> = {
	animation: {
		spotlight: "spotlight 2s ease .75s 1 forwards",
		"accordion-down": "accordion-down 0.2s ease-out",
		"accordion-up": "accordion-up 0.2s ease-out",
		aurora: "aurora 60s linear infinite",
	},
	keyframes: {
		spotlight: {
			"0%": {
				opacity: "0",
				transform: "translate(-72%, -62%) scale(0.5)",
			},
			"100%": {
				opacity: "1",
				transform: "translate(-50%,-40%) scale(1)",
			},
		},
		"accordion-down": {
			from: { height: "0" },
			to: { height: "var(--radix-accordion-content-height)" },
		},
		"accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: "0" },
		},
		aurora: {
			from: {
				backgroundPosition: "50% 50%, 50% 50%",
			},
			to: {
				backgroundPosition: "350% 50%, 350% 50%",
			},
		},
	},
};

export default tailwindAnimations;
