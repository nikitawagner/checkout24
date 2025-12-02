export type Result<T, E = Error> =
	| { success: true; data: T }
	| { success: false; error: E };

export const toResult = async <T, E = Error>(
	promise: Promise<T>,
): Promise<Result<T, E>> => {
	try {
		const data = await promise;
		return { success: true, data };
	} catch (error) {
		return { success: false, error: error as E };
	}
};

