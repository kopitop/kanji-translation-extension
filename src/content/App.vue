<template>
  <div v-show="show" class="tool-tips-wrapper" :style="'left:' + mousePosition.mouseX + 'px; top:' + mousePosition.mouseY + 'px;'">
    <div class="tool-tips-wrapper__content">
      <button @click="close">Close</button>
      <h3>{{ highlightedText }} : {{ translation }}</h3>
      <tabs v-if="kanjiArray.length" :options="{ useUrlFragment: false }">
        <tab :name="item.character" v-for="item in kanjiArray" v-bind:key="item.id">
          <h3>Meaning : {{ item.meaning }}</h3>
          <h3>Japanese Reading : {{ item.kunyomi }}</h3>
          <h3>Chinese Reading : {{ item.onyomi }}</h3>
        </tab>
      </tabs>
    </div>
  </div>
</template>

<script>
import { range, from, of, forkJoin } from 'rxjs';
import { map, filter, delay, concatMap, mergeMap, flatMap, switchMap } from 'rxjs/operators';
import { Axios } from 'axios-observable';
import { Tabs, Tab } from 'vue-tabs-component';

export default {
  components: {
    Tabs,
    Tab
  },
  data() {
    return {
      translation: '',
      kanjiArray: [],
      show: true
    }
  },
  props: ['highlightedText', 'mousePosition'],
  created() {
    of(this.highlightedText).pipe(
      map(text => {
        return Axios.get(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20190519T201455Z.8a4682f680e240f3.815e0741b24fc40dd5a9f2f593a3b5e920cdece2`, {
          params: {
            text,
            lang : 'ja-en',
          },
        })
      }),
      mergeMap(response => response)
    ).subscribe(
      translationResponse => {
        const { data: { text } } = translationResponse;
        console.log(text);

        return this.translation = text[0];
      },
      error => console.log(error)
    );

    from(this.highlightedText).pipe(
      filter(kanji => {
        if (kanji != ' '){
          return true;
        }
        return false;
      }),
      concatMap(kanji => of(kanji).pipe(delay(200))),
      mergeMap(kanji => {
        return Axios.get(`https://kanjialive-api.p.rapidapi.com/api/public/kanji/${encodeURI(kanji)}`, {
          headers: {
            'X-RapidAPI-Host': 'kanjialive-api.p.rapidapi.com',
            'X-RapidAPI-Key': 'uxQXv7OoIKmshZyCqEAVYho9DfFIp1eASH0jsnXVw09nfQtEGJ'
          },
        })
      }),
      filter(response => {
        return response.status;
      }),
      map(response => {
        return response.data;
      }),
    ).subscribe(
      kanjiResponse => {
        if(kanjiResponse.error) {
          return;
        };

        return this.appendToKanjiList(kanjiResponse);
      },
      error => console.log(error)
    );
  },
  methods: {
    appendToKanjiList(kanjiResponse) {
      const { kanji: { meaning : { english }, character, onyomi : { katakana }, kunyomi : { hiragana } } } = kanjiResponse;

      this.kanjiArray = [ ...this.kanjiArray, { meaning: english, character, onyomi: katakana, kunyomi: hiragana }]
    },
    close() {
      this.show = false;

      return;
    }
  }
};
</script>

<style lang="scss" scoped>
.tool-tips-wrapper {
  position: absolute;
  box-shadow: 0 1px #FFFFFF inset, 0 1px 3px rgba(34, 25, 25, 0.4);
  width: 300px;
  z-index: 999999;
  overflow: scroll;
  border-radius: 10px;
  background: white;
  padding: 10px;

  h3 {
    margin-top: 10px;
  }
}
</style>
