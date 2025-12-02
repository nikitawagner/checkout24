import { auth } from "@clerk/nextjs/server";
import type { EmailDeps } from "./deps";
import { formatEmailRequest, validateEmailResponse } from "./internal";
import type { EmailRequest, EmailResponse } from "./types";

export type IEmailService = {
	send: (request: EmailRequest) => Promise<EmailResponse>;
};

export const createEmailService = (deps: EmailDeps): IEmailService => {
	const { config: emailConfig } = deps;

	const send = async (request: EmailRequest): Promise<EmailResponse> => {
		const { userId } = await auth();

		if (!userId) {
			throw new Error("Unauthorized - User must be authenticated");
		}

		const formattedRequest = formatEmailRequest(
			request.to,
			request.subject,
			request.html,
			request.text,
			request.from || emailConfig.from,
			request.cc,
			request.bcc,
		);

		const apiKey = emailConfig.apiKey || process.env.RESEND_API_KEY;
		if (!apiKey) {
			throw new Error("Email API key not configured");
		}

		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(formattedRequest),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Email API error: ${response.statusText} - ${error}`);
		}

		const data = await response.json();

		return validateEmailResponse({
			messageId: data.id || data.messageId || "",
			userId,
			timestamp: new Date(),
		});
	};

	return {
		send,
	};
};
