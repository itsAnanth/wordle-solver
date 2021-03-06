import { EventEmitter } from 'events';

export default class Wordle extends EventEmitter {
    public lastSuggestion?: string;
    private knownPositions: Record<number, string> = {};
    private knownWrongPositions: Record<number, string[]> = {};
    private knownCounts: Record<string, number> = {};
    private knownChars: string[] = [];
    private knownWrong: string[] = [];
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
        if (this.lastSuggestion) {
            score.map((x, i) => {
                if (x === 2) this.knownPositions[i] = this.lastSuggestion![i];
                else if (x === 1) this.knownWrongPositions[i] = [...this.knownWrongPositions[i] || [], this.lastSuggestion![i]];
            });
            for (const c of new Set(this.lastSuggestion)) {
                const count = this.lastSuggestion.split('').reduce((a, b, i) => {
                    if (b === c) a[Math.sign(score[i])]++;
                    return a;
                }, [0, 0]);
                if (count[0]) {
                    if (count[1]) {
                        this.knownCounts[c] = count[1];
                        continue;
                    }
                    this.knownWrong.push(c);
                    continue;
                }
                this.knownChars.push(c);
            }
        }
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
            && Object.entries(this.knownWrongPositions).every(([i, a]) => !a.includes(word[+i]))
            && Object.entries(this.knownCounts).every(([c, n]) => word.split('').filter(x => x === c).length === n)
            && this.knownChars.every(x => word.includes(x))
            && this.knownWrong.every(x => !word.includes(x));
    }
}