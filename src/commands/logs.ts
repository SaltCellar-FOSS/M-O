import type { transports } from 'winston';
import logger from '../logger.js';
import { isAuthorized } from './authorization.js';
import type { Command } from './index.js';

export default {
	data: {
		name: 'logs',
		description: "Exports M-O's logs. Helpful for diagnosing issues.",
	},
	async execute(interaction) {
		if (!(await isAuthorized(interaction.guild, interaction.member))) {
			logger.warn(`An unauthorized member attempted to retrieve logs!`, {
				guild: interaction.guild?.id,
				member: interaction.user.id,
			});
			return;
		}

		await interaction.deferReply({ ephemeral: true });
		const combinedFileTransport = logger.transports[1] as transports.FileTransportInstance;

		await interaction.editReply({ files: [combinedFileTransport.filename] });
	},
} satisfies Command;
