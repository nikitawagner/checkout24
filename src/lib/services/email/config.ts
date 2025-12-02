export const EMAIL_CONFIG = {
	from: process.env.EMAIL_FROM || "noreply@checkout24.com",
	provider: "resend",
} as const;

export type EmailConfig = {
	from: string;
	provider: string;
	apiKey?: string;
};

