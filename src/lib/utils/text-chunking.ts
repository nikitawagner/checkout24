const DEFAULT_CHUNK_SIZE_IN_CHARACTERS = 2_000;
const DEFAULT_OVERLAP_IN_CHARACTERS = 200;

type ChunkTextOptions = {
	maxChunkSizeInCharacters?: number;
	overlapInCharacters?: number;
};

type TextChunk = {
	index: number;
	text: string;
};

export const chunkText = (
	text: string,
	options: ChunkTextOptions = {},
): TextChunk[] => {
	const maxChunkSize =
		options.maxChunkSizeInCharacters ?? DEFAULT_CHUNK_SIZE_IN_CHARACTERS;
	const overlap = options.overlapInCharacters ?? DEFAULT_OVERLAP_IN_CHARACTERS;

	const normalizedText = text.replace(/\s+/g, " ").trim();

	if (normalizedText.length <= maxChunkSize) {
		return [{ index: 0, text: normalizedText }];
	}

	const chunks: TextChunk[] = [];
	let startPosition = 0;
	let chunkIndex = 0;

	while (startPosition < normalizedText.length) {
		let endPosition = startPosition + maxChunkSize;

		if (endPosition >= normalizedText.length) {
			endPosition = normalizedText.length;
		} else {
			const sentenceEndMatch = normalizedText
				.slice(startPosition, endPosition)
				.match(/.*[.!?]\s/);

			if (sentenceEndMatch) {
				const lastSentenceEnd = sentenceEndMatch[0].length + startPosition - 1;

				if (lastSentenceEnd > startPosition + maxChunkSize / 2) {
					endPosition = lastSentenceEnd;
				}
			}
		}

		const chunkText = normalizedText.slice(startPosition, endPosition).trim();

		if (chunkText.length > 0) {
			chunks.push({
				index: chunkIndex,
				text: chunkText,
			});
			chunkIndex++;
		}

		startPosition = endPosition - overlap;

		if (startPosition >= normalizedText.length - overlap) {
			break;
		}
	}

	return chunks;
};
