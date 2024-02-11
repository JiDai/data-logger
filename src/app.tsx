import type {Component} from 'solid-js';
import {entries} from './store'


const App: Component = () => {
    return (
        <div class="container mx-auto">
            <h1>ok ?</h1>
            {entries.map(entry => {
                console.log('entry: ', entry)
                return entry.type
            })}
            <div class="columns-3">
                <div>v</div>
                <div>b</div>
                <div>c</div>
            </div>
        </div>
    );
};

export default App;
