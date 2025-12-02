import type { EmailResponse } from "./types";

export const validateEmailResponse = (response: unknown): EmailResponse => {
	if (!response || typeof response !== "object") {
		throw new Error("Invalid email response: response is not an object");
	}

	const resp = response as Record<string, unknown>;

	if (typeof resp.messageId !== "string") {
		throw new Error("Invalid email response: messageId is not a string");
	}

	if (typeof resp.userId !== "string") {
		throw new Error("Invalid email response: userId is not a string");
	}

	return {
		messageId: resp.messageId,
		userId: resp.userId,
		timestamp:
			resp.timestamp instanceof Date
				? resp.timestamp
				: new Date(resp.timestamp as string),
	};
};

export const formatEmailRequest = (
	to: string | string[],
	subject: string,
	html: string | undefined,
	text: string | undefined,
	from: string,
	cc?: string | string[],
	bcc?: string | string[],
) => {
	return {
		from,
		to: Array.isArray(to) ? to : [to],
		subject,
		...(html && { html }),
		...(text && { text }),
		...(cc && { cc: Array.isArray(cc) ? cc : [cc] }),
		...(bcc && { bcc: Array.isArray(bcc) ? bcc : [bcc] }),
	};
};

