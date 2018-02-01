/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

const commando = require('discord.js-commando'),
	{oneLine} = require('common-tags'),
	path = require('path'),
	MAX_LENGTH = require(path.join(__dirname, 'data/GlobalData.js')).MAX_LENGTH; // eslint-disable-line sort-vars

module.exports = class MaxLengthCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'maxlength',
			'aliases': ['max-duration', 'max-song-length', 'max-song-duration'],
			'group': 'music',
			'memberName': 'maxlength',
			'description': 'Shows or sets the max song length.',
			'format': '[minutes|"default"]',
			'details': oneLine `
            This is the maximum length of a song that users may queue, in minutes.
            The default is ${MAX_LENGTH}.
            Only administrators may change this setting.`,
			'examples': ['maxlength 10'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			}
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	hasPermission (msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}

	run (msg, args) {
		if (!args) {
			const maxLength = this.client.provider.get(msg.guild.id, 'maxLength', MAX_LENGTH);

			return msg.reply(`the maximum length of a song is ${maxLength} minutes.`);
		}

		if (args.toLowerCase() === 'default') {
			this.client.provider.remove(msg.guild.id, 'maxLength');

			return msg.reply(`set the maximum song length to the default (currently ${MAX_LENGTH} minutes).`);
		}

		const maxLength = parseInt(args, 10);

		if (isNaN(maxLength) || maxLength <= 0) {
			return msg.reply('invalid number provided.');
		}

		this.client.provider.set(msg.guild.id, 'maxLength', maxLength);

		return msg.reply(`set the maximum song length to ${maxLength} minutes.`);
	}
};