import fetch from 'node-fetch';
import { createInterface } from 'readline';
import Wordle from './Wordle';

const BASE = 'https://www.powerlanguage.co.uk/wordle/';

console.log('Loading words...');
fetch(BASE)
    .then(d => d.text())
    .then(d => fetch(BASE + d.match(/<script src="(main\..+?\.js)"/)![1]))
    .then(d => d.text())
    .then(d => {
        const words: string[] = JSON.parse(d.match(/var La=(\[.+?\])/)![1]);
        console.log('Successfully loaded', words.length, 'words');
        console.log('Try typing the suggested words into Wordle, then type the results into the console.');
        console.log('Type a 0 for black characters, a 1 for yellow characters, and a 2 for green characters.');
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
            prompt: '> Result: '
        });
        rl.on('line', x => {
            if (x.length !== words[0].length) {
                console.log('Invalid answer length.');
                return rl.prompt();
            } 
            if (!/^[0-2]+$/.test(x)) {
                console.log('Invalid answer syntax.');
                return rl.prompt();
            }
            wordle.step(x.split('').map(x => +x));
        });
        const wordle = new Wordle(words)
            .on('step', w => {
                console.log('> Suggestion:', w);
                rl.prompt();
            })
            .on('end', reason => {
                console.log('Game over:', reason);
                process.exit(0);
            })
            .init();
    });