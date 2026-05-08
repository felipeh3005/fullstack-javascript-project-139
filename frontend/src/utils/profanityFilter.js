import leoProfanity from 'leo-profanity';

leoProfanity.loadDictionary('en');

const cleanProfanity = (text) => leoProfanity.clean(text);

export default cleanProfanity;
