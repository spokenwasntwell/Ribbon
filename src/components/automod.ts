/**
 * @file Ribbon Automod - Automod module for Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna
 */

import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import levenshtein from 'fast-levenshtein';
import * as moment from 'moment';
import { countCaps, countEmojis, countMentions, numberBetween } from './util';

export const badwords = (msg: CommandoMessage, words: Array<string>, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (words.some((v: string) => msg.content.indexOf(v) >= 0)) {
    return true;
  }

  return false;
};

export const duptext = (msg: CommandoMessage, within: number, equals: number, distance: number, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  const authorMessages = msg.channel.messages.filter(m => {
    const diff = moment.duration(moment(m.createdTimestamp).diff(moment()));

    return numberBetween(diff.asMinutes(), within * -1, 0, true) && m.author.id === msg.author.id;
  });

  if (authorMessages.size <= equals) {
    return false;
  }

  const msgArray = authorMessages.array();

  msgArray.sort((x, y) => y.createdTimestamp - x.createdTimestamp);

  const levdist = levenshtein.get(msgArray[0].cleanContent, msgArray[1].cleanContent);

  if (levdist <= distance) {
    return true;
  }

  return false;
};

export const caps = (msg: CommandoMessage, threshold: number, minlength: number, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (msg.cleanContent.length >= minlength) {
    if (countCaps(msg.content, msg.cleanContent) >= threshold) {
      return true;
    }
  }

  return false;
};

export const emojis = (msg: CommandoMessage, threshold: number, minlength: number, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (msg.cleanContent.length >= minlength) {
    if (countEmojis(msg.content) >= threshold) {
      return true;
    }
  }

  return false;
};

export const mentions = (msg: CommandoMessage, threshold: number, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (countMentions(msg.content) >= threshold) {
    return true;
  }

  return false;
};

export const links = (msg: CommandoMessage, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if ((/https?:\/\/(?!discordapp\.com|discord.gg)[^\s]+/gim).test(msg.content)) {
    return true;
  }

  return false;
};

export const invites = (msg: CommandoMessage, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if ((/(?:discord\.gg|discordapp.com\/invite)/gim).test(msg.content)) {
    return true;
  }

  return false;
};

export const slowmode = (msg: CommandoMessage, within: number, client: CommandoClient) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  const authorMessages = msg.channel.messages.filter(m => {
    const diff = moment.duration(moment(m.createdTimestamp).diff(moment()));

    return numberBetween(diff.asSeconds(), within * -1, 0, true) && m.author.id === msg.author.id;
  });

  const msgArray = authorMessages.array();

  if (msgArray.length) {
    const diff = moment.duration(moment(msgArray[0].createdAt).diff(moment()));

    if (diff.asSeconds() <= within) {
      return true;
    }
  }

  return false;
};