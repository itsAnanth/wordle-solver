import { EventEmitter } from 'events';

export default class Wordle extends EventEmitter {
    public lastSuggestion?: string;
    private knownPositions: Record<number, string> = {};
    private knownWrongPositions: Record<number, string> = {};
    private knownChars: string[] = [];
    private forbiddenChars: string[] = [];
    private words: string[];
    constructor(words: string[]) {
        super();
        this.words = this.processWords(words);
    }

    public init() {
        this.step([]);
        return this;
    }

    public step(score: number[]) {
        if (score.length && score.every(x => x === 2)) return this.emit('end', 'Victory');
        score.map((x, i) => {
            const c = this.lastSuggestion![i];
            if (x === 2) this.knownPositions[i] = c;
            if (x === 1) this.knownWrongPositions[i] = c;
            if (x > 0) this.knownChars.push(c);
            else this.forbiddenChars.push(c);
        });
        const guess = this.words.filter(x => this.checkWord(x))[0];
        if (!guess) this.emit('end', 'No words remaining');
        this.emit('step', this.lastSuggestion = guess);
    }

    private processWords(words: string[]) {
        const chars = words.reduce((a, b) => b.split('').map((x, i) => (a[x] || (a[x] = Array.from({ length: words[0].length }, () => 0)))[i]++) && a, <Record<string, number[]>>{});
        return words
            .map(x => <const>[x, x.split('').reduce((a, b, i) => a + chars[b][i], 0)])
            .sort((a, b) => b[1] - a[1])
            .map(x => x[0]);
    }

    private checkWord(word: string) {
        return Object.entries(this.knownPositions).every(([i, c]) => word[+i] === c)
            && Object.entries(this.knownWrongPositions).every(([i, c]) => word[+i] !== c)
            && this.knownChars.every(c => word.includes(c))
            && this.forbiddenChars.every(c => !word.includes(c));
    }
}