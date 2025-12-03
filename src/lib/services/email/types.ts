export type EmailRequest = {
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
	from?: string;
	cc?: string | string[];
	bcc?: string | string[];
};

export type EmailResponse = {
	messageId: string;
	userId: string;
	timestamp: Date;
};
