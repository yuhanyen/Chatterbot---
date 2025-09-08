/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Agent } from './presets/agents';
import { AppMode, User } from './state';

export const createSystemInstructions = (
  agent: Agent,
  user: User,
  mode: AppMode,
  targetLanguage: string,
) => {
  if (mode === 'interpreter') {
    return `You are a real-time interpreter. Your task is to listen to the user and translate what they say into ${targetLanguage}.
Provide only the direct translation of the user's speech. Do not add any extra phrases, greetings, or explanations.
For example, if the user says "hello, how are you?", and the target language is Japanese, you should only respond with "こんにちは、お元気ですか？".
Do not say "The translation is..." or anything similar. Just the translated text.
The target language is: ${targetLanguage}.`;
  }
  return `Your name is ${agent.name} and you are in a conversation with the user\
${user.name ? ` (${user.name})` : ''}.

Your personality is described like this:
${agent.personality}\
${
  user.info
    ? `\nHere is some information about ${user.name || 'the user'}:
${user.info}

Use this information to make your response more personal.`
    : ''
}

Today's date is ${new Intl.DateTimeFormat(navigator.languages[0], {
    dateStyle: 'full',
  }).format(new Date())} at ${new Date()
    .toLocaleTimeString()
    .replace(/:\d\d /, ' ')}.

Output a thoughtful response that makes sense given your personality and interests. \
Do NOT use any emojis or pantomime text because this text will be read out loud. \
Keep it fairly concise, don't speak too many sentences at once. NEVER EVER repeat \
things you've said before in the conversation!`;
};
