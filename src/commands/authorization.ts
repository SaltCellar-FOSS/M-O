import process from 'node:process';
import type { APIInteractionGuildMember, Guild, GuildMember } from 'discord.js';
import logger from '../logger.js';

export const isAuthorized = async (
	guild: Guild | null,
	member: APIInteractionGuildMember | GuildMember | null,
): Promise<boolean> => {
	if (process.env.ROLE_ID === undefined) {
		logger.error(`ROLE_ID was not set in environment variables.`);
		return false;
	}

	if (guild === null) {
		logger.error(`Guild provided for authorization was null!`);
		return false;
	}

	const authorizedRole = await guild.roles.fetch(process.env.ROLE_ID!);
	if (authorizedRole === null) {
		logger.error(`A ROLE_ID was provided, but no matching role was found on guild ${guild.id}`);
		return false;
	}

	try {
		return (member as GuildMember).roles.cache.has(authorizedRole.id);
	} catch {
		return (member as APIInteractionGuildMember).roles.includes(authorizedRole.id) ?? false;
	}
};
