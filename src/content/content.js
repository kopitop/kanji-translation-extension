import Vue from 'vue';
import App from './App';
import { fromEvent, interval } from 'rxjs';
import { throttle, filter, throttleTime, debounceTime } from 'rxjs/operators';
import 'vue-tabs-component/docs/resources/tabs-component.css';
import './content.scss';
/* eslint-disable no-new */

(function() {
  console.log('Initialized');

  const InitKanjiBushuToolTipVueObject = function(e) {
    let text;
    if (window.getSelection) {
      text = window.getSelection();
    } else if (document.getSelection) {
      text = document.getSelection();
    } else if (document.selection) {
      text = document.selection.createRange().text;
    }

    const highlightedText = text.toString();

    if (document.getElementById('kanji-bushu-tool-tips-wrapper')) {
      let element = document.getElementById('kanji-bushu-tool-tips-wrapper');
      element.parentNode.removeChild(element);
    }

    const mousePosition = {
      mouseX: e.pageX,
      mouseY: e.pageY,
    };

    const KanjiBushuToolTipVueWrapperObject = document.createElement('div');
    const KanjiBushuToolTipVueObject = document.createElement('div');
    KanjiBushuToolTipVueWrapperObject.setAttribute('id', 'kanji-bushu-tool-tips-wrapper');
    KanjiBushuToolTipVueObject.setAttribute('id', 'kanji-bushu-tool-tips');
    KanjiBushuToolTipVueWrapperObject.append(KanjiBushuToolTipVueObject);
    document.body.append(KanjiBushuToolTipVueWrapperObject);

    new Vue({
      el: '#kanji-bushu-tool-tips',
      render(createElement) {
        return createElement(App, {
          props: {
            mousePosition,
            highlightedText,
          },
        });
      },
    });
  };

  const mouseUpEventsStream = fromEvent(document, 'mouseup');
  mouseUpEventsStream
    .pipe(
      debounceTime(1000),
      filter(e => {
        return window.getSelection().toString();
      }),
      filter(e => {
        return document.getElementById('kanji-bushu-tool-tips-wrapper') ? !document.getElementById('kanji-bushu-tool-tips-wrapper').contains(e.target) : true;
      })
    )
    .subscribe(InitKanjiBushuToolTipVueObject);
  if (!document.all) {
    document.captureEvents(Event.MOUSEUP);
  }
})();
