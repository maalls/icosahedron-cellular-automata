import { Impl1 } from "./implementation/Impl1";
import { Impl2 } from "./implementation/Impl2";
import { Impl3 } from "./implementation/Impl3";
import { Impl4 } from "./implementation/Impl4";
import { Impl5 } from "./implementation/Impl5";

export class Controller {


    constructor(engine) {

        let impls = [new Impl5(), new Impl1(), new Impl2(), new Impl3(), new Impl4()];
        let params = new URLSearchParams(window.location.search);
        let implIndex = params.has('impl') ? params.get('impl') : 0;
        let impl = impls[implIndex];

        engine.setImplementation(impl);

        let play = params.has('autoplay') && parseInt(params.get('autoplay')) ? true : false;

        if (play) {
            engine.play();
        }

        const implSelect = document.createElement('select');


        impls.forEach((impl, key) => {
            console.log(impl);
            const option = document.createElement('option');
            option.value = key;
            option.innerHTML = impl.ui.name;
            if (key == implIndex) {
                option.selected = "selected";
            }
            implSelect.appendChild(option);
        });
        implSelect.onchange = function (event) {
            console.log(this.selectedIndex);
            impl = impls[this.selectedIndex];
            params.set('impl', this.selectedIndex);
            var newRelativePathQuery = window.location.pathname + '?' + params.toString();
            history.pushState(null, '', newRelativePathQuery);
            engine.setImplementation(impl);
            engine.reset();
        }
        document.getElementById('impl-settings').appendChild(implSelect);

        if (impl.hasOwnProperty('getUiSetting')) {
            let uiSettings = impl.getUiSetting();
            if (uiSettings != undefined) {

                uiSettings.forEach(setting => {

                    switch (setting.type) {

                        case 'select':


                    }
                });

            }
        }

        

        document.getElementById('player').innerText = this.play ? 'pause' : 'play';
        document.getElementById('player').onclick = (event) => {
            event.preventDefault();
            if (engine.isPlaying) {
                engine.pause(); 
                document.getElementById('player').innerText = 'play';
            }
            else {
                engine.play();
                document.getElementById('player').innerText = 'pause';
            }
        }

        document.getElementById('step').onclick = (event) => {
            event.preventDefault();
            engine.update();
        }

        document.getElementById('undo').onclick = (event) => {
            event.preventDefault();
            engine.undo();
        }
        document.getElementById('controller').onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
        }

        document.getElementById('reset').onclick = (event) => {
            engine.reset();
            
        }
        document.getElementById('clear').onclick = (event) => {
            engine.clear();
            engine.applyColors();
            
        }


    }

    

}