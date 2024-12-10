import readyEvent from '../events/ready.js';
import logger from '../logger.js';
import { isAuthorized } from './authorization.js';
import type { Command } from './index.js';

export default {
	data: {
		name: 'flush',
		description: 'Manually flushes all expired messages. Seldom needed.',
	},
	async execute(interaction) {
		if (!(await isAuthorized(interaction.guild, interaction.member))) {
			logger.warn(`An unauthorized member attempted to flush messages!`, {
				guild: interaction.guild?.id,
				member: interaction.user.id,
			});
			return;
		}

		await interaction.deferReply({ ephemeral: true });
		// Rather than duplicating code, let's just invoke the "ready" event's
		// execute function, as that does everything that we want anyway.
		await readyEvent.execute(interaction.client);

		await interaction.editReply('Done!');
	},
} satisfies Command;
